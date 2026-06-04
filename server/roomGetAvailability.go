package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func getBookingAvailability(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getBookingAvailability: Received request to fetch booking availability")
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	memberID := params["usermemberid"]
	logMessage(DEBUG, fmt.Sprintf("getBookingAvailability: Fetching bookings for memberID: %s", memberID))

	collection := client.Database(DBName).Collection(UserRoomBookingCollection)

	filter := bson.M{"memberid": memberID}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getBookingAvailability: Error fetching bookings: %v", err))
		http.Error(w, "Error fetching bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var bookings []BookingData
	if err = cursor.All(context.TODO(), &bookings); err != nil {
		logMessage(ERROR, fmt.Sprintf("getBookingAvailability: Error decoding booking data: %v", err))
		http.Error(w, "Error decoding booking data", http.StatusInternalServerError)
		return
	}

	if len(bookings) == 0 {
		logMessage(WARN, fmt.Sprintf("getBookingAvailability: No bookings found for memberID: %s", memberID))
		http.Error(w, "No bookings found", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("getBookingAvailability: Successfully fetched %d bookings for memberID: %s", len(bookings), memberID))

	json.NewEncoder(w).Encode(bookings)
}
