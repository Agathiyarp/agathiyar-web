package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/jung-kurt/gofpdf"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/gomail.v2"
)

func registerEvent(w http.ResponseWriter, r *http.Request) {
	var memberData EventRegistration

	if err := json.NewDecoder(r.Body).Decode(&memberData); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventRegisterCollection)

	_, err := collection.InsertOne(context.TODO(), memberData)
	if err != nil {
		http.Error(w, "Failed to insert data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ➕ PDF generation
	pdfFileName, Email, err := generateBookingPDFevent(memberData)
	if err != nil {
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
		return
	}
	defer os.Remove(pdfFileName)

	// 📧 Send booking email with PDF
	if err := sendBookingEmailEvent(memberData, pdfFileName, Email); err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Data inserted successfully!",
	})
}
func generateBookingPDFevent(booking EventRegistration) (string, string, error) {
	type User struct {
		Name  string `bson:"name"`
		Email string `bson:"email"`
	}

	// ✅ Create context
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ✅ MongoDB lookup
	collection := client.Database(DBName).Collection(UserCollection)
	filter := bson.M{"usermemberid": booking.MemberID}

	var user User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return "", "", fmt.Errorf("user not found: %v", err)
	}

	// ✅ Create PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	margin := 15.0
	leftPadding := 25.0
	pageWidth, pageHeight := pdf.GetPageSize()
	contentWidth := pageWidth - 2*margin
	pdf.SetMargins(margin, margin, margin)
	pdf.SetAutoPageBreak(true, margin)

	pdf.SetDrawColor(150, 150, 150)
	pdf.SetLineWidth(1.0)
	pdf.Rect(margin, margin, contentWidth, pageHeight-2*margin, "D")

	logoPath := "logo1.png"
	logoWidth := 18.0
	logoHeight := 18.0
	pdf.SetFont("Arial", "B", 16)
	titleStr := "Agathiyar Pyramid Dhyana Ashram"
	titleWidth := pdf.GetStringWidth(titleStr)
	headerTotalWidth := logoWidth + 5 + titleWidth
	startX := (pageWidth - headerTotalWidth) / 2

	if _, err := os.Stat(logoPath); err == nil {
		pdf.ImageOptions(logoPath, startX, margin+5, logoWidth, logoHeight, false, gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}, 0, "")
	}
	pdf.SetXY(startX+logoWidth+5, margin+10)
	pdf.CellFormat(titleWidth, 8, titleStr, "", 1, "L", false, 0, "")

	pdf.SetY(margin + 25)
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 128, 0)
	pdf.CellFormat(0, 10, "Event Registration Confirmed", "", 1, "C", false, 0, "")
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

	// ✅ Add all fields
	addLabelValue("Booking ID:", booking.EventID)
	addLabelValue("Member ID:", booking.MemberID)
	addLabelValue("User Name:", booking.Name)
	addLabelValue("Email:", booking.Email)
	addLabelValue("User Type:", booking.UserType)
	addLabelValue("Event Name:", booking.EventName)
	addLabelValue("Event Master Name:", booking.EventMasterName)
	addLabelValue("Event Time:", booking.EventTime)
	addLabelValue("Event Days:", booking.EventDays)
	addLabelValue("Event Place:", booking.EventPlace)
	addLabelValue("Contact:", booking.Contact)

	layout := "2006-01-02"
	startDateParsed, err := time.Parse(layout, booking.StartDate)
	if err != nil {
		return "", "", fmt.Errorf("invalid start date format: %v", err)
	}
	endDateParsed, err := time.Parse(layout, booking.EndDate)
	if err != nil {
		return "", "", fmt.Errorf("invalid end date format: %v", err)
	}
	addLabelValue("Start Date:", startDateParsed.Format("02-Jan-2006"))
	addLabelValue("End Date:", endDateParsed.Format("02-Jan-2006"))

	addLabelValue("Register:", fmt.Sprintf("%v", booking.Register))
	addLabelValue("Guests:", booking.Guests)
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
	outputPath := filepath.Join("pdf/file", fmt.Sprintf("%s.pdf", booking.MemberID))
	err = pdf.OutputFileAndClose(outputPath)
	if err != nil {
		return "", "", err
	}
	return outputPath, user.Email, nil
}

// sendBookingEmail sends an email with the booking confirmation PDF attached

func sendBookingEmailEvent(booking EventRegistration, pdfFilePath string, Email string) error {
	subject := "Event Registration Completed"
	body := "Your Event has registered. Please find the attached PDF for details."

	message := gomail.NewMessage()
	message.SetHeader("From", AgathiyarEmail)
	message.SetHeader("To", Email) // Safe to use after nil check
	message.SetHeader("Subject", subject)
	message.SetBody("text/plain", body)
	message.Attach(pdfFilePath)

	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		fmt.Println("Decryption error:", err)
		return err
	}

	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	if err := dialer.DialAndSend(message); err != nil {
		fmt.Println("Error sending email:", err)
		return err
	}

	fmt.Println("Email sent successfully!")
	return nil
}
