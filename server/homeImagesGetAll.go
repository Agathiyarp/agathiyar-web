package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetAllHomeImages(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "GetAllHomeImages: Received request to fetch all home gallery images")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	collection := client.Database(DBName).Collection(HomeGalleryCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Sort by upload date descending (newest first)
	findOptions := options.Find().SetSort(bson.D{
		{Key: "uploadAt", Value: -1},
	})

	// No filter (bson.M{}) to get everything
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		logMessage(ERROR, "GetAllHomeImages: Database error: "+err.Error())
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var gallery []HomeGalleryItem
	if err = cursor.All(ctx, &gallery); err != nil {
		logMessage(ERROR, "GetAllHomeImages: Cursor error: "+err.Error())
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, "GetAllHomeImages: Successfully fetched all home gallery images")
	json.NewEncoder(w).Encode(gallery)
}
