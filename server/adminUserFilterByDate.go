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

func filterUsersByDateHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "filterUsersByDateHandler: Received request to filter users by date")
	vars := mux.Vars(r)
	startDateStr := vars["startdate"]
	endDateStr := vars["enddate"]

	logMessage(DEBUG, fmt.Sprintf("filterUsersByDateHandler: Filtering users from %s to %s", startDateStr, endDateStr))

	// Parse input dates in UTC to match MongoDB Date format
	startDate, err1 := time.ParseInLocation("2006-01-02", startDateStr, time.UTC)
	endDate, err2 := time.ParseInLocation("2006-01-02", endDateStr, time.UTC)
	if err1 != nil || err2 != nil {
		logMessage(WARN, fmt.Sprintf("filterUsersByDateHandler: Invalid date format: start=%s, end=%s", startDateStr, endDateStr))
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	// Extend endDate by 1 day to make the filter inclusive
	endDateExclusive := endDate.Add(24 * time.Hour)

	logMessage(DEBUG, fmt.Sprintf("filterUsersByDateHandler: MongoDB Filter: createddate >= %v AND < %v", startDate, endDateExclusive))

	// MongoDB connection
	collection := client.Database(DBName).Collection(UserCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ✅ Corrected field name from "createdat" to "createddate"
	filter := bson.M{
		"createddate": bson.M{
			"$gte": startDate,
			"$lt":  endDateExclusive,
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("filterUsersByDateHandler: MongoDB Find error: %v", err))
		http.Error(w, "Error retrieving users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []AllUserResponse
	for cursor.Next(ctx) {
		var user AllUserResponse
		if err := cursor.Decode(&user); err != nil {
			logMessage(ERROR, fmt.Sprintf("filterUsersByDateHandler: Error decoding user: %v", err))
			continue
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		logMessage(ERROR, fmt.Sprintf("filterUsersByDateHandler: Cursor iteration error: %v", err))
		http.Error(w, "Error reading results", http.StatusInternalServerError)
		return
	}

	if len(users) == 0 {
		logMessage(WARN, fmt.Sprintf("filterUsersByDateHandler: No users found between %s and %s", startDateStr, endDateStr))
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "No users found for the given date range",
		})
		return
	}

	logMessage(INFO, fmt.Sprintf("filterUsersByDateHandler: Successfully found %d users", len(users)))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
