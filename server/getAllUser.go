package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "GetAllUsersHandler: Received request to fetch all users")
	collection := client.Database(DBName).Collection(UserCollection)

	if err := client.Ping(context.TODO(), nil); err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllUsersHandler: Database ping failed: %v", err))
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Filter out users where isDeleted is true
	filter := bson.M{"$or": []bson.M{
		{"isDeleted": false},
		{"isDeleted": bson.M{"$exists": false}},
	}}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllUsersHandler: Error finding users: %v", err))
		http.Error(w, "Error retrieving users from database", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var allUsers []AllUserResponse
	for cursor.Next(context.TODO()) {
		// DEBUG: First check raw document
		var raw bson.M
		if err := cursor.Decode(&raw); err != nil {
			logMessage(ERROR, fmt.Sprintf("GetAllUsersHandler: Error decoding raw document: %v", err))
			continue
		}

		// Debug print to see what's actually in the document
		logMessage(DEBUG, fmt.Sprintf("GetAllUsersHandler: Processing user: %s, userHistory field: %+v", raw["usermemberid"], raw["userHistory"]))

		// Now decode into your struct
		var responseuser RegisterUser
		bsonBytes, _ := bson.Marshal(raw)
		bson.Unmarshal(bsonBytes, &responseuser)

		// Ensure UserHistory is never null in response
		if responseuser.UserHistory == nil {
			responseuser.UserHistory = []UserHistory{}
		}

		allUsers = append(allUsers, AllUserResponse{
			Name:                responseuser.Name,
			Email:               responseuser.Email,
			PhoneNumber:         responseuser.PhoneNumber,
			Country:             responseuser.Country,
			Username:            responseuser.Username,
			UserMemberID:        responseuser.UserMemberID,
			UserType:            responseuser.UserType,
			UserRole:            responseuser.UserRole,
			Gender:              responseuser.Gender,
			DateOfBirth:         responseuser.DateOfBirth,
			Address:             responseuser.Address,
			UserAccess:          responseuser.UserAccess,
			CreditModifyDate:    responseuser.CreditModifyDate,
			UserTypeModifyDate:  responseuser.UserTypeModifyDate,
			AgathiyarRoom:       responseuser.AgathiyarRoom,
			PathrijiRoom:        responseuser.PathrijiRoom,
			DormitoryRoom:       responseuser.DormitoryRoom,
			TotalRoomAvailed:    responseuser.TotalRoomAvailed,
			CreditUsed:          responseuser.Credits,
			UserTotalDaysBooked: responseuser.UserTotalDaysBooked,
			CreditModifyReason:  responseuser.CreditModifyReason,
			Createddate:         responseuser.Createddate,
			Password:            responseuser.Password,
			UserHistory:         responseuser.UserHistory,
		})
	}

	if err := cursor.Err(); err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllUsersHandler: Cursor error: %v", err))
		http.Error(w, "Error reading user data", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("GetAllUsersHandler: Successfully processed %d users", len(allUsers)))

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(allUsers); err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllUsersHandler: Error encoding response: %v", err))
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, "GetAllUsersHandler: Response sent successfully")
}
