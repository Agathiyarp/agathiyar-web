package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// =================== Custom Date Type ===================
type CustomDate time.Time

func (cd *CustomDate) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	if s == "" {
		return nil
	}
	// Expected layout: 18-Aug-2025
	layout := "02-Jan-2006"
	t, err := time.Parse(layout, s)
	if err != nil {
		return fmt.Errorf("invalid date format: %s, expected dd-MMM-yyyy", s)
	}
	*cd = CustomDate(t)
	return nil
}

func (cd CustomDate) Time() time.Time {
	return time.Time(cd)
}

// =================== Booking Update ===================
func UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UpdateBookingStatus: Received request to update booking status")
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		MemberId         string     `json:"memberid"`
		BookingID        string     `json:"bookingid"`
		BookingStatus    string     `json:"bookingstatus"`
		TotalRoomsBooked int        `json:"totalroomsbooked"`
		CreditUsed       int        `json:"creditused"`
		StartDate        CustomDate `json:"startdate"`
		EndDate          CustomDate `json:"enddate"`
		Reason           string     `json:"reason"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Invalid JSON payload: %v", err))
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(req.BookingID)
	if err != nil {
		// Not a valid full ObjectID, so try to search using suffix
		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Short bookingId detected: %s", req.BookingID))

		collection := client.Database(DBName).Collection(RoomBookingCollection)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		cursor, err := collection.Find(ctx, bson.M{})
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Failed to search booking: %v", err))
			http.Error(w, "Failed to search booking: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		found := false
		for cursor.Next(ctx) {
			var doc struct {
				ID primitive.ObjectID `bson:"_id"`
			}
			if err := cursor.Decode(&doc); err == nil {
				hexID := doc.ID.Hex()
				if len(hexID) >= len(req.BookingID) && hexID[len(hexID)-len(req.BookingID):] == req.BookingID {
					objID = doc.ID
					found = true
					break
				}
			}
		}
		if !found {
			logMessage(WARN, fmt.Sprintf("UpdateBookingStatus: Booking ID not found (shortID: %s)", req.BookingID))
			http.Error(w, "Booking ID not found (shortID: "+req.BookingID+")", http.StatusNotFound)
			return
		}
	}

	collection := client.Database(DBName).Collection(RoomBookingCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"_id": objID, "memberid": req.MemberId}
	update := bson.M{"$set": bson.M{
		"bookingstatus":       req.BookingStatus,
		"bookingcancelreason": req.Reason,
	}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Update failed: %v", err))
		http.Error(w, "Update failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("UpdateBookingStatus: No booking found for ID %s and member ID %s", objID.Hex(), req.MemberId))
		http.Error(w, "No booking found for the given ID and member ID", http.StatusNotFound)
		return
	}

	var bookingSummary BookingSummary
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&bookingSummary)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("UpdateBookingStatus: Booking updated but failed to fetch details: %v", err))
		http.Error(w, "Booking updated but failed to fetch details", http.StatusInternalServerError)
		return
	}

	usersCol := client.Database(DBName).Collection(UserCollection)
	var roomField string
	switch strings.ToLower(bookingSummary.Destination) {
	case "agathiyar bhavan":
		roomField = "agathiyarroom"
	case "patriji bhavan":
		roomField = "patrijiroom"
	case "agathiyar bhavan ac":
		roomField = "agathiyarroomac"
	case "patriji bhavan ac":
		roomField = "patrijiroomac"
	case "dormitory":
		roomField = "dormitoryroom"
	default:
		logMessage(WARN, fmt.Sprintf("UpdateBookingStatus: Unknown destination: %s", bookingSummary.Destination))
		http.Error(w, "Invalid destination", http.StatusBadRequest)
		return
	}

	bookedDates := getDatesBetween(req.StartDate.Time(), req.EndDate.Time())
	totalDays := len(bookedDates)

	if req.BookingStatus == "rejected" {
		logMessage(DEBUG, "UpdateBookingStatus: Processing rejection logic")
		filter := bson.M{"_id": objID}
		var result struct {
			CreditUsed int `bson:"creditused"`
		}

		err := collection.FindOne(context.TODO(), filter).Decode(&result)
		if err != nil {
			logMessage(WARN, fmt.Sprintf("UpdateBookingStatus: Booking not found or error: %v", err))
		} else {
			logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Credit Used: %d", result.CreditUsed))
		}

		// Make all increment fields negative
		incFields := bson.M{
			"totalroomavailed": 0,
			"totaldaysbooked":  0,
			roomField:          0,
			"credits":          result.CreditUsed,
		}

		userUpdate := bson.M{
			"$inc": incFields,
		}
		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Rejection user update: %v", userUpdate))
		if _, err := usersCol.UpdateOne(
			context.TODO(),
			bson.M{"usermemberid": bookingSummary.MemberId},
			userUpdate,
		); err != nil {
			logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Failed updating User info: %v", err))
		}

		// Update daily room availability (increment rooms back)
		dailyAvailCol := client.Database(DBName).Collection(DailyAvailCollection)

		var roomField string
		switch bookingSummary.Destination {
		case RoomAgathiyar:
			roomField = "agathiyar"
		case "Patriji Bhavan":
			roomField = "patriji"
		case "Agathiyar Bhavan AC":
			roomField = "agathiyarac"
		case "Patriji Bhavan AC":
			roomField = "patrijiac"
		default:
			roomField = "dormitory"
		}

		roomsChange := int32(bookingSummary.TotalRoomsBooked)
		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Rooms to change: %d", roomsChange))

		// Truncate time to remove hour/minute/second
		startDate := bookingSummary.StartDate.Truncate(24 * time.Hour)
		endDate := bookingSummary.EndDate.Truncate(24 * time.Hour)

		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Booking Start Date: %s, End Date: %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")))
		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Room field to update: %s", roomField))

		// Loop from StartDate up TO (but not including) EndDate
		for d := startDate; d.Before(endDate); d = d.AddDate(0, 0, 1) {
			dateStr := d.Format("2006-01-02")
			logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Updating availability for date: %s", dateStr))

			var beforeDoc bson.M
			err := dailyAvailCol.FindOne(context.TODO(), bson.M{"date": dateStr}).Decode(&beforeDoc)
			if err != nil {
				logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: No document found for %s: %v", dateStr, err))
				http.Error(w, fmt.Sprintf("No availability document found for %s", dateStr), http.StatusNotFound)
				return
			}
			logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Before update: %v", beforeDoc))

			update := bson.M{"$inc": bson.M{roomField: roomsChange}}
			result, err := dailyAvailCol.UpdateOne(context.TODO(), bson.M{"date": dateStr}, update)
			if err != nil {
				logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Error updating daily availability for %s: %v", dateStr, err))
				http.Error(w, "Error updating daily availability", http.StatusInternalServerError)
				return
			}

			logMessage(INFO, fmt.Sprintf("UpdateBookingStatus: Update result for %s - Matched: %d, Modified: %d", dateStr, result.MatchedCount, result.ModifiedCount))

			var afterDoc bson.M
			_ = dailyAvailCol.FindOne(context.TODO(), bson.M{"date": dateStr}).Decode(&afterDoc)
			logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: After update: %v", afterDoc))
		}

	} else {
		incFields := bson.M{
			"totalroomavailed": req.TotalRoomsBooked,
			"totaldaysbooked":  totalDays,
			roomField:          req.TotalRoomsBooked,
			"credits":          0,
		}

		userUpdate := bson.M{
			"$inc": incFields,
		}
		logMessage(DEBUG, fmt.Sprintf("UpdateBookingStatus: Approval user update: %v", userUpdate))
		if _, err := usersCol.UpdateOne(
			context.TODO(),
			bson.M{"usermemberid": bookingSummary.MemberId},
			userUpdate,
		); err != nil {
			logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Failed updating User info: %v", err))
		}
	}

	pdfFileName, err := generateBookingPDF(bookingSummary)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Failed to generate PDF: %v", err))
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
		return
	}
	defer os.Remove(pdfFileName)

	if err := sendBookingEmail(bookingSummary, pdfFileName); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateBookingStatus: Failed to send email: %v", err))
		http.Error(w, "Failed to send confirmation email", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("UpdateBookingStatus: Booking status updated to %s", req.BookingStatus))
	json.NewEncoder(w).Encode(bson.M{
		"message":        "Booking status updated and email sent successfully",
		"updatedStatus":  req.BookingStatus,
		"bookingid":      req.BookingID,
		"updatedRecords": result.ModifiedCount,
	})
}

// =================== Helper ===================
func getDatesBetween(start, end time.Time) []time.Time {
	var dates []time.Time
	current := start
	for !current.After(end) {
		dates = append(dates, current)
		current = current.AddDate(0, 0, 1)
	}
	return dates
}
