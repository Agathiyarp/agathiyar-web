package main

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

// Filters bookings by destination and date range
func getBookingRecords(w http.ResponseWriter, r *http.Request) {
	// Extract collection name from the request

	// Access the collection dynamically
	collection := client.Database(DBName).Collection(BookingDetailsCollection)

	// Retrieve all records
	cursor, err := collection.Find(context.TODO(), bson.D{})
	if err != nil {
		http.Error(w, "Failed to retrieve records", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	// Decode all records into a generic slice
	var records []bson.M
	if err := cursor.All(context.TODO(), &records); err != nil {
		http.Error(w, "Failed to decode records", http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(records)
}
