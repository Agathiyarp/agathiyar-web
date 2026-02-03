package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// GET /api/dailyavailability
func getDailyAvailability(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getDailyAvailability: Received request to fetch daily availability")
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := client.Database(DBName).Collection(DailyAvailCollection)

	// Get current date string in YYYY-MM-DD format
	currentDateStr := time.Now().Format("2006-01-02")
	logMessage(DEBUG, fmt.Sprintf("getDailyAvailability: Fetching availability from date: %s", currentDateStr))

	// Filter to get only documents with date >= current date
	filter := bson.M{
		"date": bson.M{
			"$gte": currentDateStr,
		},
	}

	cur, err := collection.Find(ctx, filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getDailyAvailability: Database query error: %v", err))
		http.Error(w, "Database query error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cur.Close(ctx)

	var results []bson.M
	if err = cur.All(ctx, &results); err != nil {
		logMessage(ERROR, fmt.Sprintf("getDailyAvailability: Error decoding results: %v", err))
		http.Error(w, "Error decoding results: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// If no results found, return empty array instead of null
	if results == nil {
		results = []bson.M{}
	}

	logMessage(INFO, fmt.Sprintf("getDailyAvailability: Successfully fetched %d availability records", len(results)))

	json.NewEncoder(w).Encode(results)
}
