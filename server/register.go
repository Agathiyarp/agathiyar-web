package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

func registerHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "registerHandler: Starting user registration process")

	var registerUser RegisterUser
	err := json.NewDecoder(r.Body).Decode(&registerUser)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error decoding JSON: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("registerHandler: Successfully decoded registration request for username: %s", registerUser.Username))

	if registerUser.Password == "" || registerUser.ConfirmPassword == "" {
		logMessage(WARN, "registerHandler: Password or ConfirmPassword is empty")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, "registerHandler: Password validation passed - both fields provided")

	if !validatePhoneNumber(registerUser.PhoneNumber) {
		logMessage(WARN, fmt.Sprintf("registerHandler: Invalid phone number: %s", registerUser.PhoneNumber))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("registerHandler: Phone number validation passed: %s", registerUser.PhoneNumber))

	// Profile image validation (OPTIONAL)
	if registerUser.ProfileImage != "" {
		registerUser.ProfileImage = validateProfileImage(registerUser.ProfileImage, registerUser.Username)
		logMessage(DEBUG, fmt.Sprintf("registerHandler: Profile image validation passed: %s", registerUser.ProfileImage))
	} else {
		registerUser.ProfileImage = ""
		logMessage(DEBUG, "registerHandler: Profile image not provided — skipping validation (optional field)")
	}

	if registerUser.Password != registerUser.ConfirmPassword {
		logMessage(WARN, "registerHandler: Passwords do not match")
		http.Error(w, "Passwords do not match", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, "registerHandler: Password confirmation matched")

	logMessage(INFO, "registerHandler: Starting User ID generation process")
	collectionUserID := client.Database(DBName).Collection(UserCommon)
	logMessage(DEBUG, fmt.Sprintf("registerHandler: Connected to MongoDB collection: %s.%s", DBName, UserCommon))

	var userCommonData CommonData

	yearMonth := time.Now().Format("2006")
	prefix := "AGP" + yearMonth
	numericLength := 5

	logMessage(DEBUG, fmt.Sprintf("registerHandler: Generated prefix: %s with numeric length: %d", prefix, numericLength))

	filter := bson.M{}
	logMessage(DEBUG, "registerHandler: Attempting to find existing user ID document")
	err = collectionUserID.FindOne(context.TODO(), filter).Decode(&userCommonData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			userCommonData.UpdateUserID = prefix + fmt.Sprintf("%0*d", numericLength, 1)
			logMessage(INFO, fmt.Sprintf("registerHandler: No existing user ID found. Initializing with: %s", userCommonData.UpdateUserID))
		} else {
			logMessage(ERROR, fmt.Sprintf("registerHandler: Error retrieving user ID document: %v", err))
			http.Error(w, "Failed to retrieve user", http.StatusInternalServerError)
			return
		}
	} else {
		logMessage(DEBUG, fmt.Sprintf("registerHandler: Found existing user ID document: %s", userCommonData.UpdateUserID))
		existingID := userCommonData.UpdateUserID

		if !strings.HasPrefix(existingID, prefix) {
			userCommonData.UpdateUserID = prefix + fmt.Sprintf("%0*d", numericLength, 1)
			logMessage(INFO, fmt.Sprintf("registerHandler: Prefix changed. Resetting user ID to: %s", userCommonData.UpdateUserID))
		} else {
			if len(existingID) < len(prefix)+numericLength {
				logMessage(ERROR, fmt.Sprintf("registerHandler: Invalid existing user ID format: %s", existingID))
				http.Error(w, "Invalid user ID format", http.StatusInternalServerError)
				return
			}
			numericPartStr := existingID[len(existingID)-numericLength:]
			currentID, convErr := strconv.Atoi(numericPartStr)
			if convErr != nil {
				logMessage(ERROR, fmt.Sprintf("registerHandler: Error converting numeric part '%s': %v", numericPartStr, convErr))
				http.Error(w, "Invalid user ID format", http.StatusInternalServerError)
				return
			}
			newNumericPart := currentID + 1
			userCommonData.UpdateUserID = prefix + fmt.Sprintf("%0*d", numericLength, newNumericPart)
			logMessage(DEBUG, fmt.Sprintf("registerHandler: Generated new user ID: %s", userCommonData.UpdateUserID))
		}
	}

	logMessage(DEBUG, "registerHandler: Updating user ID document in database")
	update := bson.M{"$set": bson.M{"updateUserID": userCommonData.UpdateUserID}}
	_, err = collectionUserID.UpdateOne(context.TODO(), filter, update, options.Update().SetUpsert(true))
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error updating user ID document: %v", err))
		http.Error(w, "Failed to update user ID", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("registerHandler: User ID successfully updated to: %s", userCommonData.UpdateUserID))

	registerUser.UserMemberID = userCommonData.UpdateUserID
	registerUser.Createddate = time.Now()
	logMessage(DEBUG, fmt.Sprintf("registerHandler: Assigned member ID: %s", registerUser.UserMemberID))

	logMessage(DEBUG, "registerHandler: Checking for existing user conflicts")
	collection := client.Database(DBName).Collection(UserCollection)

	var existingUser RegisterUser
	filters := bson.M{
		"$or": []bson.M{
			{"username": registerUser.Username},
			{"usermemberid": registerUser.UserMemberID},
		},
	}
	err = collection.FindOne(context.TODO(), filters).Decode(&existingUser)
	if err == nil {
		logMessage(WARN, fmt.Sprintf("registerHandler: Conflict: User already exists with username: %s or memberID: %s", registerUser.Username, registerUser.UserMemberID))
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}
	logMessage(DEBUG, "registerHandler: No existing user conflict found")

	logMessage(DEBUG, "registerHandler: Starting password hashing")
	userPassword := registerUser.Password
	hashedPassword, err := hashPassword(userPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error hashing password: %v", err))
		http.Error(w, "Password hashing failed", http.StatusInternalServerError)
		return
	}
	registerUser.Password = hashedPassword
	registerUser.ConfirmPassword = hashedPassword
	registerUser.UserAccess = []string{
		"users", "userAdd", "events", "bookings", "video", "books",
		"eventDetails", "bookingAdd", "userAdd", "eventsAdd", "usersCredit", "bookingConfirmation", "Images", "blockRooms", "usersCredit", "manualBooking",
	}
	logMessage(DEBUG, "registerHandler: Password hashed and user access assigned")

	logMessage(DEBUG, "registerHandler: Inserting user into database")
	_, err = collection.InsertOne(context.TODO(), registerUser)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error inserting user: %v", err))
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("registerHandler: User successfully inserted: %s", registerUser.Username))

	logMessage(DEBUG, "registerHandler: Generating registration PDF")
	pdfFilePath, err := generateRegistrationPDF(registerUser, userPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error generating PDF: %v", err))
		http.Error(w, "PDF generation failed", http.StatusInternalServerError)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("registerHandler: PDF generated at: %s", pdfFilePath))

	logMessage(DEBUG, "registerHandler: Sending registration email")
	err = sendRegistrationEmail(registerUser, pdfFilePath, userPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("registerHandler: Error sending email: %v", err))
		http.Error(w, "Email sending failed", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("registerHandler: Email sent to: %s", registerUser.Username))

	logMessage(INFO, "registerHandler: Registration completed successfully")
	response := Response{Message: "User registered successfully"}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
	logMessage(INFO, fmt.Sprintf("registerHandler: Registered user: %s with ID: %s", registerUser.Username, registerUser.UserMemberID))
}

func generateRegistrationPDF(registerUser RegisterUser, userPassword string) (string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	if pdf == nil {
		return "", fmt.Errorf("failed to initialize PDF generator")
	}
	pdf.AddPage()

	// Layout settings
	margin := 15.0
	leftPadding := 25.0
	pageWidth, pageHeight := pdf.GetPageSize()
	contentWidth := pageWidth - 2*margin
	pdf.SetMargins(margin, margin, margin)
	pdf.SetAutoPageBreak(true, margin)

	// Draw border rectangle
	pdf.SetDrawColor(150, 150, 150)
	pdf.SetLineWidth(1.0)
	pdf.Rect(margin, margin, contentWidth, pageHeight-2*margin, "D")

	// Header with logo and title
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

	// Title of document
	pdf.SetY(margin + 25)
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 128, 0) // dark green
	pdf.CellFormat(0, 10, "User Registration Details", "", 1, "C", false, 0, "")
	pdf.SetTextColor(0, 0, 0) // reset color to black
	pdf.Ln(5)
	pdf.SetFont("Arial", "", 12)

	// Helper to add label-value pairs
	addLabelValue := func(label, value string) {
		pdf.SetX(leftPadding)
		pdf.SetFont("Arial", "B", 11)
		pdf.CellFormat(50, 8, label, "", 0, "", false, 0, "")
		pdf.SetFont("Arial", "", 11)
		pdf.CellFormat(0, 8, value, "", 1, "", false, 0, "")
	}

	// Add fields
	addLabelValue("Name:", registerUser.Name)
	addLabelValue("Email:", registerUser.Email)
	addLabelValue("Phone Number:", registerUser.PhoneNumber)
	addLabelValue("Country:", registerUser.Country)
	addLabelValue("Username:", registerUser.Username)
	addLabelValue("Password:", userPassword)
	addLabelValue("User Member ID:", registerUser.UserMemberID)
	addLabelValue("Date of Birth:", registerUser.DateOfBirth)
	addLabelValue("Gender:", registerUser.Gender)
	addLabelValue("Address:", registerUser.Address)

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

	// Save PDF
	pdfFilePath := filepath.Join("pdf/userregistration", fmt.Sprintf("%s_registration.pdf", registerUser.UserMemberID))
	err := pdf.OutputFileAndClose(pdfFilePath)
	if err != nil {
		return "", err
	}

	return pdfFilePath, nil
}

func sendRegistrationEmail(registerUser RegisterUser, pdfFilePath string, userPassword string) error {
	subject := "Welcome to Agathiyar!"
	body := fmt.Sprintf("Hello %s,\n\nYour account has been successfully created. Please find the attached PDF for your registration details.\n\nUser Login Details below,\nUserName: %s\nMemberID: %s\nPassword: %s\n\nThank you for registering with us.\n\nBest regards,\nAgathiyar Team", registerUser.Name, registerUser.Username, registerUser.UserMemberID, userPassword)

	// Create a new email message
	message := gomail.NewMessage()
	message.SetHeader("From", AgathiyarEmail)
	message.SetHeader("To", registerUser.Email)
	message.SetHeader("Subject", subject)
	message.SetBody("text/plain", body)

	// Attach the PDF file
	message.Attach(pdfFilePath)

	// Decrypt the connection string
	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("sendRegistrationEmail: Decryption error: %v", err))
		return nil
	}
	logMessage(DEBUG, fmt.Sprintf("sendRegistrationEmail: Decrypted: %s", decrypted))
	// Set up the SMTP dialer
	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	// Send the email
	if err := dialer.DialAndSend(message); err != nil {
		logMessage(ERROR, fmt.Sprintf("sendRegistrationEmail: Error sending email: %v", err))
		return err
	}

	logMessage(INFO, "sendRegistrationEmail: Registration email sent successfully!")
	return nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func validateProfileImage(imageData string, username string) string {
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Starting validation for user: %s", username))

	// Check inputs
	if imageData == "" {
		logMessage(WARN, "validateProfileImage: input image string is empty")
		return "empty image string"
	}
	if username == "" {
		logMessage(WARN, "validateProfileImage: username is empty")
		return "username cannot be empty"
	}

	// Remove data URI prefix if present
	if strings.HasPrefix(imageData, "data:") {
		parts := strings.SplitN(imageData, ",", 2)
		if len(parts) != 2 {
			return "invalid data URI format"
		}
		imageData = parts[1]
		logMessage(DEBUG, "validateProfileImage: Data URI prefix removed")
	}

	// Decode base64
	logMessage(DEBUG, "validateProfileImage: Decoding base64 image data")
	data, err := base64.StdEncoding.DecodeString(imageData)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("validateProfileImage: Failed to decode base64 image: %v", err))
		return "invalid base64 image"
	}
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Base64 image decoded successfully, size: %d bytes", len(data)))

	// Detect image type
	imgReader := bytes.NewReader(data)
	_, format, err := image.DecodeConfig(imgReader)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("validateProfileImage: Failed to detect image type, defaulting to png: %v", err))
		format = "png"
	}
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Detected image type: %s", format))

	// Generate unique filename
	filename := fmt.Sprintf("%s_%d.%s", username, time.Now().Unix(), format)
	filePath := filepath.Join(ProfileImagePath, filename)
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Generated filename: %s", filename))
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Target file path: %s", filePath))

	// Save file
	logMessage(DEBUG, "validateProfileImage: Writing image data to file")
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("validateProfileImage: Error saving file: %v", err))
		return "error saving file"
	}
	logMessage(INFO, "validateProfileImage: Image saved successfully")

	// Generate public URL
	imageURL := fmt.Sprintf("https://www.agathiyarpyramid.org/api/user/profile-image/%s", filename)
	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Public image URL generated: %s", imageURL))

	logMessage(DEBUG, fmt.Sprintf("validateProfileImage: Completed successfully for user: %s", username))
	return filename
}

func validatePhoneNumber(phone string) bool {
	regex := `^\+?[1-9]\d{1,14}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(phone)
}
