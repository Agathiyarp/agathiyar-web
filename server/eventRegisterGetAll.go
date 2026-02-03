package main

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func getAllEventRegistrations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	collection := client.Database(DBName).Collection(EventRegisterCollection)

	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch records: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var registrations []EventRegistration
	if err := cursor.All(context.TODO(), &registrations); err != nil {
		http.Error(w, "Failed to decode records: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(registrations)
}
