package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

func AddVideo(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "AddVideo: Received request to add video")
	var newVideo Video
	err := json.NewDecoder(r.Body).Decode(&newVideo)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("AddVideo: Failed to decode request body: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("AddVideo: Decoded video: %s", newVideo.Name))

	collection := client.Database(DBName).Collection(VideoCollection)

	_, err = collection.InsertOne(context.TODO(), newVideo)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("AddVideo: Failed to insert video into MongoDB: %v", err))
		http.Error(w, "Failed to store video", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("AddVideo: Video '%s' added successfully", newVideo.Name))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Video added successfully"})
}
