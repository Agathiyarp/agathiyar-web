package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "loginHandler: Received login request")

	var registerUser RegisterUser
	if err := json.NewDecoder(r.Body).Decode(&registerUser); err != nil {
		logMessage(ERROR, fmt.Sprintf("loginHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("loginHandler: Login attempt for username/memberID: %s", registerUser.Username))

	collection := client.Database(DBName).Collection(UserCollection)
	var existingUser RegisterUser
	filter := bson.M{
		"$or": []bson.M{
			{"username": registerUser.Username},
			{"usermemberid": registerUser.Username},
		},
	}
	if err := collection.FindOne(context.TODO(), filter).Decode(&existingUser); err != nil {
		if err == mongo.ErrNoDocuments {
			logMessage(WARN, fmt.Sprintf("loginHandler: No user found with username/memberID: %s", registerUser.Username))
			http.Error(w, "Invalid username, memberID, or password", http.StatusUnauthorized)
		} else {
			logMessage(ERROR, fmt.Sprintf("loginHandler: MongoDB error on FindOne: %v", err))
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	logMessage(DEBUG, fmt.Sprintf("loginHandler: Found user: %s with userType: %s", existingUser.Username, existingUser.UserType))

	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(registerUser.Password)); err != nil {
		logMessage(WARN, fmt.Sprintf("loginHandler: Password mismatch for user: %s", existingUser.Username))
		http.Error(w, "Invalid username, memberID, or password", http.StatusUnauthorized)
		return
	}
	logMessage(INFO, fmt.Sprintf("loginHandler: Password verified for user: %s", existingUser.Username))

	// ✅ Prepare response
	response := LoginResponse{
		Username:            existingUser.Username,
		UserMemberID:        existingUser.UserMemberID,
		UserType:            existingUser.UserType,
		UserRole:            existingUser.UserRole,
		UserImage:           existingUser.ProfileImage,
		UserPhone:           existingUser.PhoneNumber,
		UserEmail:           existingUser.Email,
		Gender:              existingUser.Gender,
		UserAccess:          existingUser.UserAccess,
		Credits:             existingUser.Credits,
		CreditModifyDate:    existingUser.CreditModifyDate,
		UserTypeModifyDate:  existingUser.UserTypeModifyDate,
		AgathiyarRoom:       existingUser.AgathiyarRoom,
		PathrijiRoom:        existingUser.PathrijiRoom,
		DormitoryRoom:       existingUser.DormitoryRoom,
		TotalRoomAvailed:    existingUser.TotalRoomAvailed,
		UserTotalDaysBooked: existingUser.UserTotalDaysBooked,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		logMessage(ERROR, fmt.Sprintf("loginHandler: Error encoding response: %v", err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("loginHandler: Response sent successfully for user: %s", existingUser.Username))
}
