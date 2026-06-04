package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetAllBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	collection := client.Database(DBName).Collection(RoomBookingCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Sort by _id in descending order to get latest records first
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "_id", Value: -1}})

	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		http.Error(w, "Failed to fetch bookings: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var bookings []map[string]interface{}
	for cursor.Next(ctx) {
		var booking BookingSummary
		if err := cursor.Decode(&booking); err != nil {
			http.Error(w, "Error decoding booking: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Generate unique 5-character booking ID
		shortID := generateShortID(booking)

		// Use StartDate and EndDate directly (don't use ValidDays)
		startDateStr := formatDate(booking.StartDate)
		endDateStr := formatDate(booking.EndDate)
		createdDateStr := formatDate(booking.CreatedDate)
		modifiedDateStr := formatDate(booking.ModifiedDate)

		// Prepare response
		bookingMap := map[string]interface{}{
			"bookingId":        shortID,
			"memberid":         booking.MemberId,
			"username":         booking.UserName,
			"email":            booking.Email,
			"roomid":           booking.RoomId,
			"destination":      booking.Destination,
			"startdate":        startDateStr,
			"enddate":          endDateStr,
			"createddate":      createdDateStr,
			"modifieddate":     modifiedDateStr,
			"singleoccupy":     booking.SingleOccupy,
			"roomdescription":  booking.RoomDescription,
			"roomtype":         booking.RoomType,
			"roomvariation":    booking.RoomVariation,
			"roomcost":         booking.RoomCost,
			"totalroomsbooked": booking.TotalRoomsBooked,
			"maintenancecost":  booking.MaintenanceCost,
			"totalamount":      booking.TotalAmount,
			"creditused":       booking.CreditUsed,
			"extrabedbooked":   booking.ExtraBedBooked,
			"bookingstatus":    booking.BookingStatus,
			"usertype":         booking.UserType,
			// Removed validdays from response since we're not using it
		}

		bookings = append(bookings, bookingMap)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}

// Helper function to generate short ID
func generateShortID(booking BookingSummary) string {
	if !booking.ID.IsZero() {
		hexID := booking.ID.Hex()
		if len(hexID) >= 5 {
			return hexID[len(hexID)-5:]
		}
		return hexID
	} else if booking.RoomId != "" && len(booking.RoomId) >= 5 {
		return booking.RoomId[len(booking.RoomId)-5:]
	}
	return fmt.Sprintf("tmp%02d", time.Now().Nanosecond()%100)
}

// Helper function to format dates consistently
func formatDate(date time.Time) string {
	if date.IsZero() {
		return ""
	}
	return date.Format("02-Jan-2006")
}
