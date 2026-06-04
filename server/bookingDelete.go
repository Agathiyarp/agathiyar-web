package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Handler to delete a booking record by ID
func deleteBookingRecordHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	bookingID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid booking ID", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(BookingDetailsCollection)
	filter := bson.M{"_id": bookingID}

	result, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		http.Error(w, "Failed to delete booking", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Booking not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking record deleted successfully"})
}
