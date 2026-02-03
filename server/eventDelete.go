package main

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Handler to delete an event by ID
func deleteEventHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	eventID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventCollection)
	filter := bson.M{"_id": eventID}

	result, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		http.Error(w, "Failed to delete event", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Event deleted successfully"))
}
