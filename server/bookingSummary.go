package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"gopkg.in/gomail.v2"
)

func bookingSummary(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "bookingSummary: Received booking request")
	var bookingSummary BookingSummary

	if r.Header.Get("Content-Type") != "application/json" {
		http.Error(w, "Content-Type must be application/json", http.StatusUnsupportedMediaType)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&bookingSummary); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingSummary: Invalid input format: %v", err))
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}

	if bookingSummary.MemberId == "" || bookingSummary.UserName == "" ||
		bookingSummary.Email == "" || bookingSummary.Destination == "" ||
		len(bookingSummary.ValidDays) == 0 || bookingSummary.RoomType == "" ||
		bookingSummary.TotalRoomsBooked <= 0 {
		logMessage(WARN, "bookingSummary: Missing or invalid booking fields")
		http.Error(w, "Missing or invalid booking fields", http.StatusBadRequest)
		return
	}

	if !strings.Contains(bookingSummary.Email, "@") {
		logMessage(WARN, fmt.Sprintf("bookingSummary: Invalid email address: %s", bookingSummary.Email))
		http.Error(w, "Invalid email address", http.StatusBadRequest)
		return
	}

	bookingCol := client.Database(DBName).Collection(RoomBookingCollection)
	usersCol := client.Database(DBName).Collection(UserCollection)
	dailyAvailCol := client.Database(DBName).Collection(DailyAvailCollection)
	var roomField string
	if bookingSummary.Destination == RoomAgathiyar {
		roomField = "agathiyar"
	} else if bookingSummary.Destination == RoomPatriji {
		roomField = "patriji"
	} else if bookingSummary.Destination == "Agathiyar Bhavan AC" {
		roomField = "agathiyarac"
	} else if bookingSummary.Destination == "Patriji Bhavan AC" {
		roomField = "patrijiac"
	} else {
		roomField = "dormitory"
	}

	//roomField := bookingSummary.Destination // Use full destination name as-is (e.g., "Agathiyar Bhavan")
	roomBookingsField := fmt.Sprintf("roombookings.%s", roomField)

	bookedDates := []string{}
	updatedBookings := bson.M{}
	totalRooms := 0

	// Fetch user
	var userDoc bson.M
	err := usersCol.FindOne(context.TODO(), bson.M{"usermemberid": bookingSummary.MemberId}).Decode(&userDoc)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("bookingSummary: User not found: %s", bookingSummary.MemberId))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	existingRoomBookings := bson.M{}
	if rb, ok := userDoc["roombookings"].(bson.M); ok {
		if destBookings, ok := rb[roomField].(bson.M); ok {
			existingRoomBookings = destBookings
		}
	}

	// Process each booking date
	for _, dateStr := range bookingSummary.ValidDays {
		bookedDates = append(bookedDates, dateStr)

		// Try to decrement room count directly with $inc
		update := bson.M{
			"$inc": bson.M{roomField: -int32(bookingSummary.TotalRoomsBooked)},
		}

		result, err := dailyAvailCol.UpdateOne(
			context.TODO(),
			bson.M{
				"date": dateStr,
				roomField: bson.M{
					"$gte": int32(bookingSummary.TotalRoomsBooked), // Only update if enough rooms
				},
			},
			update,
		)

		if err != nil {
			logMessage(ERROR, fmt.Sprintf("bookingSummary: Error updating daily availability for %s: %v", dateStr, err))
			http.Error(w, "Error updating daily availability", http.StatusInternalServerError)
			return
		}

		if result.MatchedCount == 0 {
			logMessage(WARN, fmt.Sprintf("bookingSummary: Not enough rooms on %s for %s", dateStr, roomField))
			http.Error(w, fmt.Sprintf("Not enough rooms on %s for %s", dateStr, roomField), http.StatusConflict)
			return
		}

		// Track user's room booking
		prevUserBooking := int32(0)
		if val, ok := existingRoomBookings[dateStr].(int32); ok {
			prevUserBooking = val
		}
		updatedBookings[dateStr] = prevUserBooking + int32(bookingSummary.TotalRoomsBooked)
		totalRooms += bookingSummary.TotalRoomsBooked
	}

	// Save the booking record
	bookingSummary.ID = primitive.NewObjectID()
	bookingSummary.BookingStatus = "pending-approval"
	bookingSummary.CreatedDate = time.Now()
	bookingSummary.ModifiedDate = time.Now()

	if _, err := bookingCol.InsertOne(context.TODO(), bookingSummary); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingSummary: Failed to save booking to MongoDB: %v", err))
		http.Error(w, "Failed to save booking", http.StatusInternalServerError)
		return
	}

	// Update user credits
	//creditUsed := totalRooms
	if bookingSummary.CreditUsed > 0 {
		filter := bson.M{"usermemberid": bookingSummary.MemberId}
		update := bson.M{
			"$inc": bson.M{"credits": -int32(bookingSummary.CreditUsed)},
		}

		result, err := usersCol.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("bookingSummary: Failed to update user credits: %v", err))
			http.Error(w, "Failed to update user credits", http.StatusInternalServerError)
			return
		}
		if result.MatchedCount == 0 {
			logMessage(WARN, fmt.Sprintf("bookingSummary: User not found for credit update: %s", bookingSummary.MemberId))
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
	}

	// Update user's room booking map
	if _, err := usersCol.UpdateOne(
		context.TODO(),
		bson.M{"usermemberid": bookingSummary.MemberId},
		bson.M{"$set": bson.M{roomBookingsField: updatedBookings}},
	); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingSummary: Failed to update user booking map: %v", err))
		http.Error(w, "Failed to update user booking map", http.StatusInternalServerError)
		return
	}

	// ➕ PDF generation
	pdfFileName, err := generateBookingPDF(bookingSummary)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingSummary: Failed to generate PDF: %v", err))
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
		return
	}
	defer os.Remove(pdfFileName)

	// 📧 Send booking email with PDF
	if err := sendBookingEmail(bookingSummary, pdfFileName); err != nil {
		logMessage(ERROR, fmt.Sprintf("bookingSummary: Failed to send email: %v", err))
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("bookingSummary: Room(s) booked successfully. Booking ID: %s", bookingSummary.ID.Hex()))

	// ✅ Final response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Room(s) booked successfully",
		"bookingId":  bookingSummary.ID.Hex(),
		"totalRooms": totalRooms,
		"totalDays":  len(bookedDates),
		"roomname":   bookingSummary.Destination,
	})
}

func generateBookingPDF(booking BookingSummary) (string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	if pdf == nil {
		return "", fmt.Errorf("failed to initialize PDF generator")
	}
	pdf.AddPage()

	// Layout setup
	margin := 15.0
	leftPadding := 25.0
	pageWidth, pageHeight := pdf.GetPageSize()
	contentWidth := pageWidth - 2*margin
	pdf.SetMargins(margin, margin, margin)
	pdf.SetAutoPageBreak(true, margin)

	// Single gray outer border
	pdf.SetDrawColor(150, 150, 150)
	pdf.SetLineWidth(1.0)
	pdf.Rect(margin, margin, contentWidth, pageHeight-2*margin, "D")

	// Header: Logo + Title (centered)
	logoPath := "logo1.png"
	logoWidth := 18.0
	logoHeight := 18.0
	pdf.SetFont("Arial", "B", 16)
	titleStr := "Agathiyar Pyramid Dhyana Ashram"
	titleWidth := pdf.GetStringWidth(titleStr)

	// Total width of logo + spacing + text
	headerTotalWidth := logoWidth + 5 + titleWidth
	startX := (pageWidth - headerTotalWidth) / 2

	// Logo
	if _, err := os.Stat(logoPath); err == nil {
		pdf.ImageOptions(logoPath, startX, margin+5, logoWidth, logoHeight, false, gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}, 0, "")
	}
	// Title
	pdf.SetXY(startX+logoWidth+5, margin+10)
	pdf.CellFormat(titleWidth, 8, titleStr, "", 1, "L", false, 0, "")

	// Booking Title (centered)
	pdf.SetY(margin + 25)
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 128, 0)
	pdf.CellFormat(0, 10, "Booking Request: "+booking.BookingStatus, "", 1, "C", false, 0, "")
	pdf.SetTextColor(0, 0, 0)

	pdf.Ln(5)
	pdf.SetFont("Arial", "", 12)

	// Label-Value Helper with left padding
	addLabelValue := func(label string, value string) {
		pdf.SetX(leftPadding)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(50, 8, label, "", 0, "", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, value, "", 1, "", false, 0, "")
	}

	addLabelValue("Booking ID:", booking.ID.Hex())
	addLabelValue("Member ID:", booking.MemberId)
	addLabelValue("User Name:", booking.UserName)
	addLabelValue("Destination:", booking.Destination)
	addLabelValue("Room Type:", booking.RoomType)
	addLabelValue("Start Date:", booking.StartDate.Format("02-Jan-2006"))
	addLabelValue("End Date:", booking.EndDate.Format("02-Jan-2006"))
	addLabelValue("Single Occupancy:", booking.SingleOccupy)

	// Room Description (bold label + wrapped description in normal font)
	pdf.SetFont("Arial", "B", 11)
	label := "Room Description:"
	labelWidth := pdf.GetStringWidth(label)
	gap := 15.0 // Horizontal space between label and description

	desc := booking.RoomDescription
	contentMaxWidth := contentWidth - (leftPadding - margin)

	// Calculate available width for description after label and gap
	descMaxWidth := contentMaxWidth - labelWidth - gap

	// Wrap description text
	pdf.SetFont("Arial", "", 11)
	descLines := pdf.SplitLines([]byte(desc), descMaxWidth)

	pdf.SetX(leftPadding)

	// First line: Label + small gap + part of description
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(labelWidth, 6, label, "", 0, "", false, 0, "")
	pdf.CellFormat(gap, 6, "", "", 0, "", false, 0, "") // horizontal gap
	pdf.SetFont("Arial", "", 11)
	pdf.CellFormat(0, 6, string(descLines[0]), "", 1, "", false, 0, "")

	// Remaining lines: only description, aligned with label start + gap
	for i := 1; i < len(descLines); i++ {
		pdf.SetX(leftPadding + labelWidth + gap)
		pdf.CellFormat(0, 6, string(descLines[i]), "", 1, "", false, 0, "")
	}

	addLabelValue("Total Rooms:", fmt.Sprintf("%d", booking.TotalRoomsBooked))
	addLabelValue("Room Variation:", booking.RoomVariation)
	addLabelValue("Room Cost:", fmt.Sprintf("%d", booking.RoomCost))
	addLabelValue("Maintenance Cost:", fmt.Sprintf("%d", booking.MaintenanceCost))
	addLabelValue("Total Amount:", fmt.Sprintf("%d", booking.TotalAmount))

	if booking.Destination == "Patriji Bhavan" && booking.ExtraBedBooked != 0 {
		addLabelValue("Extra Bed Booked:", fmt.Sprintf("%d", booking.ExtraBedBooked))
		addLabelValue("Extra Bed Booked Amount:", "300")
	}

	addLabelValue("Booking Status:", booking.BookingStatus)
	addLabelValue("Booking Cancel Reason:", booking.BookingCancelReason)

	// ➕ Add space after Booking Status
	pdf.Ln(10)

	// Footer Notes
	pdf.SetFont("Arial", "B", 10)
	pdf.SetX(leftPadding)
	pdf.Cell(0, 6, "Note:")
	pdf.Ln(6)
	pdf.SetFont("Arial", "", 10)
	pdf.SetX(leftPadding)
	pdf.MultiCell(0, 6, "This is an auto-generated message from Agathiyar Pyramid Dhyana Ashram.", "", "L", false)

	pdf.Ln(3)
	pdf.SetFont("Arial", "B", 10)
	pdf.SetX(leftPadding)
	pdf.Cell(0, 6, "Disclaimer:")
	pdf.Ln(5)
	pdf.SetFont("Arial", "", 10)
	pdf.SetX(leftPadding)
	pdf.MultiCell(0, 5, `This communication is intended solely for informational purposes related to activities and services of Agathiyar Pyramid Dhyana Ashram.
If you are not the intended recipient, please delete this message. Any unauthorized use, disclosure, or distribution is prohibited.

For inquiries or assistance, please visit our website at www.agathiyarpyramid.org
or contact our support team at +91 85250 44990.

© Agathiyar Pyramid Dhyana Ashram. All rights reserved.`, "", "L", false)

	pdf.Ln(5)
	pdf.SetFont("Arial", "I", 10)
	pdf.SetX(leftPadding)
	pdf.MultiCell(0, 5, "May peace, love, and light guide your path.\nWith blessings,\nAgathiyar Pyramid Dhyana Ashram", "", "", false)

	// Save to file
	outputPath := filepath.Join("pdf/file", fmt.Sprintf("%s.pdf", booking.MemberId))
	err := pdf.OutputFileAndClose(outputPath)
	if err != nil {
		return "", err
	}
	return outputPath, nil
}

// sendBookingEmail sends an email with the booking confirmation PDF attached

func sendBookingEmail(booking BookingSummary, pdfFilePath string) error {
	subject := "Booking Request " + booking.BookingStatus
	body := "Your booking has been confirmed. Please find the attached PDF for details."

	message := gomail.NewMessage()
	message.SetHeader("From", AgathiyarEmail)
	message.SetHeader("To", booking.Email) // Safe to use after nil check
	message.SetHeader("Subject", subject)
	message.SetBody("text/plain", body)
	message.Attach(pdfFilePath)

	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("sendBookingEmail: Decryption error: %v", err))
		return err
	}

	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	if err := dialer.DialAndSend(message); err != nil {
		logMessage(ERROR, fmt.Sprintf("sendBookingEmail: Error sending email: %v", err))
		return err
	}

	logMessage(INFO, "sendBookingEmail: Email sent successfully!")
	return nil
}
