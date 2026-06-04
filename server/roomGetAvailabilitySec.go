package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func getRoomAvailabilityByDateRange(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getRoomAvailabilityByDateRange: Received request to fetch room availability by date range")
	w.Header().Set("Content-Type", "application/json")

	startDate := r.URL.Query().Get("start")
	endDate := r.URL.Query().Get("end")

	if startDate == "" || endDate == "" {
		logMessage(WARN, "getRoomAvailabilityByDateRange: Missing start or end date")
		http.Error(w, "Missing start or end date", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("getRoomAvailabilityByDateRange: Fetching availability from %s to %s", startDate, endDate))

	collection := client.Database(DBName).Collection(DailyAvailCollection)

	// Find all entries between start and end date (inclusive)
	filter := bson.M{
		"date": bson.M{
			"$gte": startDate,
			"$lte": endDate,
		},
	}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getRoomAvailabilityByDateRange: Error fetching room availability: %v", err))
		http.Error(w, "Error querying data", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var results []bson.M
	if err := cursor.All(context.TODO(), &results); err != nil {
		logMessage(ERROR, fmt.Sprintf("getRoomAvailabilityByDateRange: Error decoding room availability: %v", err))
		http.Error(w, "Error decoding data", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("getRoomAvailabilityByDateRange: Successfully fetched %d availability records", len(results)))

	json.NewEncoder(w).Encode(results)
}
