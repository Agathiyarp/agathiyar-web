package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

func GetVideos(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "GetVideos: Received request to fetch videos")

	// Connect to MongoDB
	collection := client.Database(DBName).Collection(VideoCollection)

	cursor, err := collection.Find(context.TODO(), bson.D{})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("GetVideos: Failed to fetch videos from MongoDB: %v", err))
		http.Error(w, "Failed to fetch videos", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var videos []Video
	if err := cursor.All(context.TODO(), &videos); err != nil {
		logMessage(ERROR, fmt.Sprintf("GetVideos: Error decoding videos: %v", err))
		http.Error(w, "Error decoding videos", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("GetVideos: Successfully fetched %d videos (IDs included)", len(videos)))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(videos)
}
