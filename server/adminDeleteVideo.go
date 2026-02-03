package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func DeleteVideo(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "DeleteVideo: Received request to delete video")

	vars := mux.Vars(r)
	idStr := vars["id"]
	logMessage(DEBUG, fmt.Sprintf("DeleteVideo: Video ID: %s", idStr))

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteVideo: Invalid ID format: %v", err))
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(VideoCollection)

	_, err = collection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteVideo: Failed to delete video record from MongoDB: %v", err))
		http.Error(w, "Failed to delete video record", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("DeleteVideo: Video record deleted successfully: %s", idStr))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Video deleted successfully"})
}
