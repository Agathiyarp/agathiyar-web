package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func UpdateUserByFlexibleIdentifier(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UpdateUserByFlexibleIdentifier: Received request to update user")

	var updateData RegisterUser
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateUserByFlexibleIdentifier: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// 🔍 Build dynamic filter for identifying the user
	filter := bson.M{}
	var identifier string
	if updateData.UserMemberID != "" {
		filter["usermemberid"] = updateData.UserMemberID
		identifier = updateData.UserMemberID
	} else if updateData.Username != "" {
		filter["username"] = updateData.Username
		identifier = updateData.Username
	} else if updateData.PhoneNumber != "" {
		filter["phoneNumber"] = updateData.PhoneNumber
		identifier = updateData.PhoneNumber
	} else {
		logMessage(WARN, "UpdateUserByFlexibleIdentifier: Missing identifier (usermemberid, username, or phoneNumber)")
		http.Error(w, "Provide usermemberid, username, or phoneNumber to identify user", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("UpdateUserByFlexibleIdentifier: Identifier: %s", identifier))

	// 🛠️ Prepare dynamic update fields
	updateFields := bson.M{}
	if updateData.Name != "" {
		updateFields["name"] = updateData.Name
	}
	if updateData.Email != "" {
		updateFields["email"] = updateData.Email
	}
	if updateData.PhoneNumber != "" {
		updateFields["phoneNumber"] = updateData.PhoneNumber
	}
	if updateData.UserRole != "" {
		updateFields["userrole"] = updateData.UserRole
	}
	if updateData.UserType != "" {
		updateFields["usertype"] = updateData.UserType
		updateFields["usertypemodifiedate"] = time.Now() // ✅ new field
	}
	if updateData.ProfileImage != "" {
		updateFields["profileImage"] = updateData.ProfileImage
	}
	if len(updateData.UserAccess) > 0 {
		updateFields["useraccess"] = updateData.UserAccess
	}
	updateFields["credits"] = updateData.Credits
	if len(updateFields) == 0 {
		logMessage(WARN, "UpdateUserByFlexibleIdentifier: No fields provided to update")
		http.Error(w, "No fields provided to update", http.StatusBadRequest)
		return
	}

	updateFields["updatedAt"] = time.Now()

	collection := client.Database(DBName).Collection(UserCollection)
	update := bson.M{"$set": updateFields}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateUserByFlexibleIdentifier: Failed to update user in MongoDB: %v", err))
		http.Error(w, "Error updating user", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("UpdateUserByFlexibleIdentifier: User not found with identifier: %s", identifier))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("UpdateUserByFlexibleIdentifier: Successfully updated user: %s", identifier))
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User updated successfully"))
}
