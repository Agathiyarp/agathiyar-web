package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

func addEventHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "addEventHandler: Received request to add event")
	var event EventAdd
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("addEventHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("addEventHandler: Decoded event: %s", event.EventName))

	collection := client.Database(DBName).Collection(EventCollection)

	result, err := collection.InsertOne(context.TODO(), event)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("addEventHandler: Failed to insert event into MongoDB: %v", err))
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("addEventHandler: Event added successfully with ID: %v", result.InsertedID))

	response := map[string]interface{}{
		"status":  "success",
		"message": "Event added successfully",
		"eventId": result.InsertedID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
