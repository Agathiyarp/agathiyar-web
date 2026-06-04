package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Handler to get an event by ID
func getEventHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	eventID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventCollection)
	var event EventAdd

	filter := bson.M{"_id": eventID}
	err = collection.FindOne(context.TODO(), filter).Decode(&event)
	if err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}
