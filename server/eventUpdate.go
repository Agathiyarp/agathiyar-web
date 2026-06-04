package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func eventUpdateHandler(w http.ResponseWriter, r *http.Request) {
	eventIDParam := mux.Vars(r)["id"]
	eventID, err := primitive.ObjectIDFromHex(eventIDParam)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	var updateData EventAdd
	err = json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventCollection)

	// Build the update document
	update := bson.M{}
	if updateData.EventName != "" {
		update["eventname"] = updateData.EventName
	}
	if updateData.MasterName != "" {
		update["mastername"] = updateData.MasterName
	}
	if updateData.StartDate != "" {
		update["startdate"] = updateData.StartDate
	}
	if updateData.EndDate != "" {
		update["enddate"] = updateData.EndDate
	}
	if updateData.NumberOfDays != "" {
		update["numberofdays"] = updateData.NumberOfDays
	}
	if updateData.EventDescription != "" {
		update["eventdescription"] = updateData.EventDescription
	}
	if updateData.Place != "" {
		update["place"] = updateData.Place
	}
	if updateData.RoomType != "" {
		update["roomtype"] = updateData.RoomType
	}
	if updateData.NumberOfParticipants != "" {
		update["numberofparticipants"] = updateData.NumberOfParticipants
	}
	if updateData.RetreatCost != "" {
		update["retreatcost"] = updateData.RetreatCost
	}
	if updateData.ReserveDeposit != "" {
		update["reservedeposit"] = updateData.ReserveDeposit
	}
	if updateData.ContactDetails != "" {
		update["contactdetails"] = updateData.ContactDetails
	}
	if updateData.Image != "" {
		update["imageurl"] = updateData.Image
	}
	if updateData.Language != "" {
		update["language"] = updateData.Language
	}

	// Perform the update
	if len(update) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	result, err := collection.UpdateOne(context.TODO(), bson.M{"_id": eventID}, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "No event found with the given ID", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"status":  "success",
		"message": "Event updated successfully",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
