package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/jung-kurt/gofpdf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gopkg.in/gomail.v2"
)

// BookingSummary extended with manual fields
type BookingManualResponse struct {
	// Map request payload
	BookingId     string `json:"bookingid"`
	FullName      string `json:"name"`
	Age           string `json:"age"`
	Gender        string `json:"gender"`
	RoomName      string `json:"roomname"`
	Address       string `json:"address"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	StartDate     string `json:"startdate"`
	EndDate       string `json:"enddate"`
	ModeOfPayment string `json:"modeOfPayment"`
	CreatedDate   string `json:"createddate"`
}

func bookingManual(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "bookingManual: Received manual booking request")
	var booking BookingManualResponse
	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Content-Type must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	// Read body
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingManual: Error reading request body: %v", err))
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(bodyBytes, &booking); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingManual: Invalid input format: %v", err))
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	if booking.BookingId == "" {
		// Parse dates
		startDate, err := time.Parse("2006-01-02", booking.StartDate)
		if err != nil {
			logMessage(WARN, fmt.Sprintf("bookingManual: Invalid start date format: %s", booking.StartDate))
			http.Error(w, "Invalid start date format (expected YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
		endDate, err := time.Parse("2006-01-02", booking.EndDate)
		if err != nil {
			logMessage(WARN, fmt.Sprintf("bookingManual: Invalid end date format: %s", booking.EndDate))
			http.Error(w, "Invalid end date format (expected YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
		createdDate, err := time.Parse(time.RFC3339, booking.CreatedDate)
		if err != nil {
			createdDate = time.Now()
		}
		booking.CreatedDate = createdDate.Format(time.RFC3339)

		roomsBooked := 1 //booking.TotalRoomsBooked

		// --- Check & Update Daily Room Availability ---
		availabilityCol := client.Database(DBName).Collection(DailyAvailCollection)

		// Loop from StartDate UP TO (but not including) EndDate
		for d := startDate; d.Before(endDate); d = d.AddDate(0, 0, 1) {
			dateStr := d.Format("2006-01-02")

			var roomField string
			switch booking.RoomName {
			case RoomAgathiyar:
				roomField = "agathiyar"
			case RoomPatriji:
				roomField = "patriji"
			default:
				roomField = "dormitory"
			}

			logMessage(DEBUG, fmt.Sprintf("bookingManual: Checking availability for Date=%s, Room=%s", dateStr, roomField))

			var availability bson.M
			err := availabilityCol.FindOne(context.TODO(),
				bson.M{"date": dateStr}).Decode(&availability)
			if err != nil {
				logMessage(WARN, fmt.Sprintf("bookingManual: Availability document not found for Date=%s", dateStr))
				http.Error(w, "Room availability not found for "+dateStr, http.StatusBadRequest)
				return
			}

			logMessage(DEBUG, fmt.Sprintf("bookingManual: Found availability: %+v", availability))

			// Extract current count
			var availableCount int32
			switch v := availability[roomField].(type) {
			case int32:
				availableCount = v
			case int64:
				availableCount = int32(v)
			case float64:
				availableCount = int32(v)
			}

			if availableCount < int32(roomsBooked) {
				logMessage(WARN, fmt.Sprintf("bookingManual: Not enough rooms available for %s", dateStr))
				http.Error(w, fmt.Sprintf("Not enough rooms available for %s", dateStr), http.StatusConflict)
				return
			}

			// Decrement by roomsBooked
			_, err = availabilityCol.UpdateOne(
				context.TODO(),
				bson.M{"date": dateStr},
				bson.M{"$inc": bson.M{roomField: -roomsBooked}},
			)
			if err != nil {
				logMessage(ERROR, fmt.Sprintf("bookingManual: Failed to update room availability: %v", err))
				http.Error(w, "Failed to update room availability", http.StatusInternalServerError)
				return
			}

			logMessage(INFO, fmt.Sprintf("bookingManual: Updated availability for Date=%s, Room=%s, Decremented by %d", dateStr, roomField, roomsBooked))
		}

	}
	// Save to Mongo
	bookingCol := client.Database(DBName).Collection(ManualBookingCollection)
	if _, err := bookingCol.InsertOne(context.TODO(), booking); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingManual: Failed to save booking to MongoDB: %v", err))
		http.Error(w, "Failed to save booking", http.StatusInternalServerError)
		return
	}
	// Generate PDF + Email
	pdfFileName, err := generateManualBookingPDF(booking)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingManual: Failed to generate PDF: %v", err))
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
		return
	}
	defer os.Remove(pdfFileName)

	if err := sendBookingManualEmail(booking, pdfFileName); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingManual: Failed to send email: %v", err))
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("bookingManual: Manual booking submitted successfully for %s", booking.FullName))

	// ✅ Send full booking record + modeOfPayment
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Manual booking submitted successfully",
		"modeOfPayment": booking.ModeOfPayment,
		"booking":       booking,
	})
}

func generateManualBookingPDF(booking BookingManualResponse) (string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	if pdf == nil {
		return "", fmt.Errorf("failed to initialize PDF generator")
	}
	pdf.AddPage()

	margin := 15.0
	leftPadding := 25.0
	pageWidth, pageHeight := pdf.GetPageSize()
	contentWidth := pageWidth - 2*margin
	pdf.SetMargins(margin, margin, margin)
	pdf.SetAutoPageBreak(true, margin)

	// Gray border
	pdf.SetDrawColor(150, 150, 150)
	pdf.SetLineWidth(1.0)
	pdf.Rect(margin, margin, contentWidth, pageHeight-2*margin, "D")

	// Header
	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(0, 10, "Agathiyar Pyramid Dhyana Ashram", "", 1, "C", false, 0, "")

	// Booking Title
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 128, 0)
	pdf.CellFormat(0, 10, "Manual Booking Request: Success", "", 1, "C", false, 0, "")
	pdf.SetTextColor(0, 0, 0)

	pdf.Ln(5)
	pdf.SetFont("Arial", "", 12)

	addLabelValue := func(label string, value string) {
		pdf.SetX(leftPadding)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(50, 8, label, "", 0, "", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, value, "", 1, "", false, 0, "")
	}

	if booking.BookingId != "" {
		addLabelValue("Booking ID:", booking.BookingId)
	}
	addLabelValue("Full Name:", booking.FullName)
	addLabelValue("Age:", booking.Age)
	addLabelValue("Gender:", booking.Gender)
	addLabelValue("Room Name:", booking.RoomName)
	addLabelValue("Phone:", booking.Phone)
	addLabelValue("Email:", booking.Email)
	addLabelValue("End Date:", mustParseDate(booking.StartDate).Format("02-Jan-2006"))
	addLabelValue("End Date:", mustParseDate(booking.EndDate).Format("02-Jan-2006"))

	addLabelValue("Address:", booking.Address)
	addLabelValue("Booking Status:", "Success")
	addLabelValue("End Date:", mustParseDate(booking.CreatedDate).Format("02-Jan-2006"))

	outputPath := filepath.Join("pdf/file", fmt.Sprintf("%s.pdf", booking.BookingId))
	err := pdf.OutputFileAndClose(outputPath)
	if err != nil {
		return "", err
	}
	return outputPath, nil
}
func mustParseDate(dateStr string) time.Time {
	t, _ := time.Parse("02-Jan-2006", dateStr) // adjust layout if needed
	return t
}

func sendBookingManualEmail(booking BookingManualResponse, pdfFilePath string) error {
	subject := "Manual Booking Request - Success"
	body := "Dear " + booking.FullName + ",\n\n" +
		"Your manual booking has been received. Please find the attached PDF for details.\n\n" +
		"Booking Details:\n" +
		"Room: " + booking.RoomName + "\n" +
		"From: " + func(d string) string {
		t, _ := time.Parse("02-Jan-2006", d)
		return t.Format("02-Jan-2006")
	}(booking.StartDate) + "\n" +
		"To: " + func(d string) string {
		t, _ := time.Parse("02-Jan-2006", d)
		return t.Format("02-Jan-2006")
	}(booking.EndDate) + "\n\n" +
		"With blessings,\nAgathiyar Pyramid Dhyana Ashram"

	message := gomail.NewMessage()
	message.SetHeader("From", AgathiyarEmail)
	message.SetHeader("To", booking.Email)
	message.SetHeader("Subject", subject)
	message.SetBody("text/plain", body)
	message.Attach(pdfFilePath)

	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		return err
	}

	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)
	return dialer.DialAndSend(message)
}
func getBooking(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getBooking: Received request to fetch all manual bookings")

	// Mongo collection
	bookingCol := client.Database(DBName).Collection(ManualBookingCollection)

	// Find all bookings sorted by CreatedAt descending (latest first)
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "createdat", Value: -1}}) // or "_id" if no CreatedAt

	cursor, err := bookingCol.Find(context.TODO(), bson.M{}, findOptions)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getBooking: Failed to fetch bookings: %v", err))
		http.Error(w, "Error fetching bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var bookings []BookingManualResponse
	if err := cursor.All(context.TODO(), &bookings); err != nil {
		logMessage(ERROR, fmt.Sprintf("getBooking: Failed to decode bookings: %v", err))
		http.Error(w, "Error decoding bookings", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("getBooking: Successfully fetched %d manual bookings", len(bookings)))

	// Return as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}
