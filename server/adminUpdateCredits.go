package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func UpdateCredits(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UpdateCredits: Received request to update credits")
	w.Header().Set("Content-Type", "application/json")
	userID := mux.Vars(r)["usermemberid"]
	logMessage(DEBUG, fmt.Sprintf("UpdateCredits: MemberID: %s", userID))

	if userID == "" {
		logMessage(WARN, "UpdateCredits: Missing user ID")
		http.Error(w, "Missing user ID", http.StatusBadRequest)
		return
	}

	var payload struct {
		Credits   int       `json:"credits"`
		Reason    string    `json:"creditmodifyreason,omitempty"`
		UpdatedAt time.Time `json:"creditmodifiedate"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateCredits: Failed to decode request body: %v", err))
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("UpdateCredits: New credits: %d, Reason: %s", payload.Credits, payload.Reason))

	if payload.Credits < 0 || payload.UpdatedAt.IsZero() {
		logMessage(WARN, "UpdateCredits: Invalid payload (credits < 0 or missing updatedAt)")
		http.Error(w, "Credits must be non-negative and updatedAt is required", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(UserCollection)
	filter := bson.M{"usermemberid": userID}

	var currentUser struct {
		Credits     int           `bson:"credits"`
		UserHistory []interface{} `bson:"userHistory,omitempty"`
	}

	err := collection.FindOne(context.TODO(), filter).Decode(&currentUser)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("UpdateCredits: User not found with MemberID: %s, Error: %v", userID, err))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Create new history entry
	newHistoryEntry := bson.M{
		"credits": payload.Credits,
		"date":    payload.UpdatedAt,
		"reason":  payload.Reason,
	}

	// Build update operation
	update := bson.M{
		"$set": bson.M{
			"credits":           payload.Credits,
			"creditmodifiedate": payload.UpdatedAt,
		},
	}

	// If userHistory doesn't exist or is null, use $set to create the array
	if currentUser.UserHistory == nil {
		update["$set"].(bson.M)["userHistory"] = []bson.M{newHistoryEntry}
	} else {
		// If userHistory exists, push to the beginning of the array
		update["$push"] = bson.M{
			"userHistory": bson.M{
				"$each":     []bson.M{newHistoryEntry},
				"$position": 0,
			},
		}
	}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateCredits: Failed to update credits in MongoDB: %v", err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("UpdateCredits: User not found during update. MemberID: %s", userID))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("UpdateCredits: Successfully updated credits for user %s. New balance: %d", userID, payload.Credits))

	response := map[string]interface{}{
		"message":         "✅ Credits updated successfully",
		"previousCredits": currentUser.Credits,
		"newCredits":      payload.Credits,
		"change":          payload.Credits - currentUser.Credits,
		"updatedAt":       payload.UpdatedAt,
	}

	json.NewEncoder(w).Encode(response)
}
