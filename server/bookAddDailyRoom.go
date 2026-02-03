package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func addDailyRoomEntry(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "addDailyRoomEntry: Received request to add daily room entry")
	w.Header().Set("Content-Type", "application/json")

	var newEntry DailyRoomEntry
	if err := json.NewDecoder(r.Body).Decode(&newEntry); err != nil {
		logMessage(ERROR, fmt.Sprintf("addDailyRoomEntry: Invalid input format: %v", err))
		http.Error(w, "Invalid input format", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("addDailyRoomEntry: Processing entry for date: %s", newEntry.Date))

	collection := client.Database(DBName).Collection(DailyAvailCollection)

	// Check if entry already exists
	var existing bson.M
	err := collection.FindOne(context.TODO(), bson.M{"date": newEntry.Date}).Decode(&existing)
	if err != mongo.ErrNoDocuments {
		logMessage(WARN, fmt.Sprintf("addDailyRoomEntry: Date entry already exists: %s", newEntry.Date))
		http.Error(w, "Date entry already exists", http.StatusConflict)
		return
	}

	// Insert new entry
	doc := bson.M{
		"date":      newEntry.Date,
		"agathiyar": newEntry.Agathiyar,
		"patriji":   newEntry.Patriji,
		"dormitory": newEntry.Dormitory,
	}

	_, err = collection.InsertOne(context.TODO(), doc)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("addDailyRoomEntry: Error inserting date entry: %v", err))
		http.Error(w, "Insert failed", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("addDailyRoomEntry: Successfully added daily room entry for date: %s", newEntry.Date))

	json.NewEncoder(w).Encode(doc)
}
