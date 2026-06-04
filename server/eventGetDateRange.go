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

func getEventsByDateRange(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	startStr := vars["startdate"]
	endStr := vars["enddate"]

	fmt.Printf("Received startDate: %s, endDate: %s\n", startStr, endStr)

	// Validate date format
	if _, err := time.Parse("2006-01-02", startStr); err != nil {
		http.Error(w, "Invalid startDate format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}
	if _, err := time.Parse("2006-01-02", endStr); err != nil {
		http.Error(w, "Invalid endDate format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventRegisterCollection)

	// Fetch events that overlap with the given range
	filter := bson.M{
		"startdate": bson.M{"$lte": endStr},
		"enddate":   bson.M{"$gte": startStr},
	}

	fmt.Printf("MongoDB filter: %+v\n", filter)

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		http.Error(w, "Error fetching records", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var results []EventRegistration
	if err := cursor.All(context.TODO(), &results); err != nil {
		http.Error(w, "Error decoding results", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Found %d event(s)\n", len(results))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
