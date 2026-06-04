package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func DeleteHomeGalleryImage(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "DeleteHomeGalleryImage: Received request to delete gallery image")

	vars := mux.Vars(r)
	idStr := vars["id"]
	sectionVar := vars["section"]
	sectionParam := r.URL.Query().Get("section")

	collection := client.Database(DBName).Collection(HomeGalleryCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var item HomeGalleryItem
	var filter bson.M

	if sectionVar != "" {
		logMessage(DEBUG, fmt.Sprintf("DeleteHomeGalleryImage: Deleting by section (URL): %s", sectionVar))
		filter = bson.M{"section": sectionVar}
	} else if sectionParam != "" {
		logMessage(DEBUG, fmt.Sprintf("DeleteHomeGalleryImage: Deleting by section (Query): %s", sectionParam))
		filter = bson.M{"section": sectionParam}
	} else if idStr != "" {
		logMessage(DEBUG, fmt.Sprintf("DeleteHomeGalleryImage: Deleting by ID: %s", idStr))
		objID, err := primitive.ObjectIDFromHex(idStr)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("DeleteHomeGalleryImage: Invalid ID format: %v", err))
			http.Error(w, "Invalid ID format", http.StatusBadRequest)
			return
		}
		filter = bson.M{"_id": objID}
	} else {
		http.Error(w, "Identifier (ID or section) is required", http.StatusBadRequest)
		return
	}

	// 1. Find the item to get the filename
	err := collection.FindOne(ctx, filter).Decode(&item)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("DeleteHomeGalleryImage: Image not found: %v", err))
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	// 2. Delete the physical file
	savePath := HomeGalleryPath
	filePath := filepath.Join(savePath, item.FileName)
	if err := os.Remove(filePath); err != nil {
		logMessage(WARN, fmt.Sprintf("DeleteHomeGalleryImage: Failed to delete gallery file %s: %v", filePath, err))
	} else {
		logMessage(INFO, fmt.Sprintf("DeleteHomeGalleryImage: Deleted gallery file: %s", filePath))
	}

	// 3. Delete from MongoDB
	_, err = collection.DeleteOne(ctx, bson.M{"_id": item.ID})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteHomeGalleryImage: Failed to delete gallery record from MongoDB: %v", err))
		http.Error(w, "Failed to delete image record", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("DeleteHomeGalleryImage: Gallery record deleted successfully: %s", item.Section))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Image deleted successfully"})
}
