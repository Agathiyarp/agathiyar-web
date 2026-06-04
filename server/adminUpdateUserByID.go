package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"regexp"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/gomail.v2"
)

func UpdateUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UpdateUserByIDHandler: Received request to update user by ID")

	vars := mux.Vars(r)
	userMemberID := vars["usermemberid"]
	if userMemberID == "" {
		logMessage(WARN, "UpdateUserByIDHandler: Missing usermemberid in URL")
		http.Error(w, "User Member ID is required", http.StatusBadRequest)
		return
	}

	var updateData RegisterUser
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateUserByIDHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("UpdateUserByIDHandler: Updating user: %s", userMemberID))

	// 🛠️ Prepare dynamic update fields
	updateFields := bson.M{}
	if updateData.Name != "" {
		updateFields["name"] = updateData.Name
	}
	if updateData.Email != "" {
		if !validateEmail(updateData.Email) {
			logMessage(WARN, fmt.Sprintf("UpdateUserByIDHandler: Invalid email format: %s", updateData.Email))
			http.Error(w, "Invalid email format", http.StatusBadRequest)
			return
		}
		updateFields["email"] = updateData.Email
	}
	if updateData.PhoneNumber != "" {
		updateFields["phonenumber"] = updateData.PhoneNumber // CHANGED: phoneNumber -> phonenumber
	}
	if updateData.UserRole != "" {
		updateFields["userrole"] = updateData.UserRole
	}
	if updateData.UserType != "" {
		updateFields["usertype"] = updateData.UserType
		updateFields["usertypemodifiedate"] = time.Now()
	}
	if updateData.ProfileImage != "" {
		updateFields["profileimage"] = updateData.ProfileImage // CHANGED: ProfileImage -> profileimage
	}
	if len(updateData.UserAccess) > 0 {
		updateFields["useraccess"] = updateData.UserAccess
	}

	if updateData.Credits != 0 {
		updateFields["credits"] = updateData.Credits
	}

	if len(updateFields) == 0 {
		logMessage(WARN, "UpdateUserByIDHandler: No fields provided to update")
		http.Error(w, "No fields provided to update", http.StatusBadRequest)
		return
	}

	updateFields["updatedat"] = time.Now() // CHANGED: updatedAt -> updatedat

	collection := client.Database(DBName).Collection(UserCollection)
	filter := bson.M{"usermemberid": userMemberID}
	update := bson.M{"$set": updateFields}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateUserByIDHandler: Failed to update user in MongoDB: %v", err))
		http.Error(w, "Error updating user", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("UpdateUserByIDHandler: User not found with ID: %s", userMemberID))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("UpdateUserByIDHandler: Successfully updated user: %s", userMemberID))

	// Fetch updated user to send email
	var updatedUser RegisterUser
	err = collection.FindOne(context.TODO(), filter).Decode(&updatedUser)
	if err == nil {
		// CHANGED: Only send email if email was in the update request
		if updateData.Email != "" {
			go func(user RegisterUser) {
				if err := sendUpdateEmail(user); err != nil {
					logMessage(ERROR, fmt.Sprintf("UpdateUserByIDHandler: Failed to send update email: %v", err))
				}
			}(updatedUser)
		}
	} else {
		logMessage(WARN, fmt.Sprintf("UpdateUserByIDHandler: Failed to fetch updated user for email: %v", err))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User updated successfully"))
}

func validateEmail(email string) bool {
	// Simple regex for email validation
	regex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(email)
}

func sendUpdateEmail(user RegisterUser) error {
	subject := "Account Details Updated - Agathiyar Pyramid Dhyana Ashram"
	body := fmt.Sprintf("Hello %s,\n\nYour account details have been successfully updated.\n\nUpdated Details:\nName: %s\nEmail: %s\nPhone: %s\nMemberID: %s\n\nIf you did not make this change, please contact us immediately.\n\nBest regards,\nAgathiyar Team",
		user.Name, user.Name, user.Email, user.PhoneNumber, user.UserMemberID)

	message := gomail.NewMessage()
	message.SetHeader("From", AgathiyarEmail)
	message.SetHeader("To", user.Email)
	message.SetHeader("Subject", subject)
	message.SetBody("text/plain", body)

	decrypted, err := Decrypt(RegisterPassword)
	if err != nil {
		return fmt.Errorf("decryption error: %v", err)
	}

	dialer := gomail.NewDialer(SmtpHost, SmtpPort, AgathiyarEmail, decrypted)

	if err := dialer.DialAndSend(message); err != nil {
		return fmt.Errorf("error sending email: %v", err)
	}

	logMessage(INFO, fmt.Sprintf("sendUpdateEmail: Update notification sent to %s", user.Email))
	return nil
}
