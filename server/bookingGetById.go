package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func GetBookingsByMemberID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	params := mux.Vars(r)
	memberID := params["usermemberid"]

	if memberID == "" {
		http.Error(w, "Missing member ID", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(RoomBookingCollection)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"memberid": memberID}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		http.Error(w, "Failed to fetch bookings: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var bookings []BookingSummary

	for cursor.Next(ctx) {
		var booking BookingSummary
		if err := cursor.Decode(&booking); err != nil {
			http.Error(w, "Error decoding booking: "+err.Error(), http.StatusInternalServerError)
			return
		}
		bookings = append(bookings, booking)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(bookings)
}
