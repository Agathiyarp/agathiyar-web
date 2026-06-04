package main

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func getAllEventsHandler(w http.ResponseWriter, r *http.Request) {

	collection := client.Database(DBName).Collection(EventCollection)
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var events []EventAdd
	for cursor.Next(context.TODO()) {
		var event EventAdd
		if err := cursor.Decode(&event); err != nil {
			http.Error(w, "Error decoding event", http.StatusInternalServerError)
			return
		}
		events = append(events, event)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}
