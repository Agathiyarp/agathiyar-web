package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func DeleteGalleryImage(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "DeleteGalleryImage: Received request to delete gallery image")

	vars := mux.Vars(r)
	idStr := vars["id"]
	logMessage(DEBUG, fmt.Sprintf("DeleteGalleryImage: Image ID: %s", idStr))

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteGalleryImage: Invalid ID format: %v", err))
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := client.Database(DBName).Collection(GalleryCollection)

	// 1. Find the item to get the filename
	var item GalleryItem
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&item)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("DeleteGalleryImage: Image not found with ID %s: %v", idStr, err))
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	// 2. Delete the physical file
	savePath := GalleryPath
	filePath := filepath.Join(savePath, item.FileName)
	if err := os.Remove(filePath); err != nil {
		logMessage(WARN, fmt.Sprintf("DeleteGalleryImage: Failed to delete gallery file %s: %v", filePath, err))
	} else {
		logMessage(INFO, fmt.Sprintf("DeleteGalleryImage: Deleted gallery file: %s", filePath))
	}

	// 3. Delete from MongoDB
	_, err = collection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteGalleryImage: Failed to delete gallery record from MongoDB: %v", err))
		http.Error(w, "Failed to delete image record", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("DeleteGalleryImage: Gallery record deleted successfully: %s", idStr))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Image deleted successfully"})
}
