package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func getAllCredits(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getAllCredits: Received request to fetch all credits")
	w.Header().Set("Content-Type", "application/json")

	var creditDetailsCol = client.Database(DBName).Collection(CreditDetailsCollection)
	cursor, err := creditDetailsCol.Find(context.TODO(), bson.M{})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getAllCredits: Failed to fetch credits from MongoDB: %v", err))
		http.Error(w, "Failed to fetch credits", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var credits []Credits
	if err := cursor.All(context.TODO(), &credits); err != nil {
		logMessage(ERROR, fmt.Sprintf("getAllCredits: Failed to decode credits: %v", err))
		http.Error(w, "Failed to decode credits", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("getAllCredits: Successfully fetched %d credit records", len(credits)))

	json.NewEncoder(w).Encode(credits)
}
