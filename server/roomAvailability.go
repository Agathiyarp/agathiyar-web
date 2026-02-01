package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func checkRoomAvailability(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "checkRoomAvailability: Received request to check room availability")
	roomID := r.URL.Query().Get("roomId")
	checkInStr := r.URL.Query().Get("checkIn")
	checkOutStr := r.URL.Query().Get("checkOut")

	if roomID == "" || checkInStr == "" || checkOutStr == "" {
		logMessage(WARN, "checkRoomAvailability: Missing required query parameters")
		http.Error(w, "Missing required query parameters", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("checkRoomAvailability: Parameters - roomId: %s, checkIn: %s, checkOut: %s", roomID, checkInStr, checkOutStr))

	// Parse check-in and check-out dates
	checkIn, err := time.Parse("2006-01-02", checkInStr)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("checkRoomAvailability: Invalid checkIn format: %s", checkInStr))
		http.Error(w, "Invalid checkIn format (expected YYYY-MM-DD)", http.StatusBadRequest)
		return
	}
	checkOut, err := time.Parse("2006-01-02", checkOutStr)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("checkRoomAvailability: Invalid checkOut format: %s", checkOutStr))
		http.Error(w, "Invalid checkOut format (expected YYYY-MM-DD)", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(BookingDetailsCollection)

	objID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("checkRoomAvailability: Invalid roomId: %s", roomID))
		http.Error(w, "Invalid roomId", http.StatusBadRequest)
		return
	}

	// Find overlapping bookings
	filter := bson.M{
		"_id": bson.M{"$eq": objID},
		"$or": []bson.M{
			{"startdate": bson.M{"$lt": checkOut}, "enddate": bson.M{"$gt": checkIn}},
		},
	}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("checkRoomAvailability: Error finding bookings: %v", err))
		http.Error(w, "Error finding bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	bookedCount := 0
	totalRooms := 0

	for cursor.Next(context.TODO()) {
		var booking BookingAdd
		if err := cursor.Decode(&booking); err != nil {
			logMessage(ERROR, fmt.Sprintf("checkRoomAvailability: Decode error: %v", err))
			continue
		}

		// Convert totalRooms string to int
		roomCount := booking.AvailableTotalRooms
		if totalRooms == 0 {
			totalRooms = roomCount // Assuming same room type has consistent total
		}

		bookedCount++
	}

	available := bookedCount < totalRooms
	logMessage(INFO, fmt.Sprintf("checkRoomAvailability: Availability check result - Total: %d, Booked: %d, Available: %v", totalRooms, bookedCount, available))

	response := map[string]any{
		"roomId":      roomID,
		"checkIn":     checkInStr,
		"checkOut":    checkOutStr,
		"totalRooms":  totalRooms,
		"bookedRooms": bookedCount,
		"available":   available,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
