package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func getEventRegistrationsByUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	userMemberID := vars["usermemberid"]

	if userMemberID == "" {
		http.Error(w, "Missing usermemberid in URL", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(EventRegisterCollection)

	filter := bson.M{"usermemberid": userMemberID}

	cursor, err := collection.Find(context.TODO(), filter)
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
