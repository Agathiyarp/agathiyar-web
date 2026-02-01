package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetHomeGalleryImages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	collection := client.Database(DBName).Collection(HomeGalleryCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Support both query param and URL variable
	vars := mux.Vars(r)
	section := vars["section"]
	if section == "" {
		section = r.URL.Query().Get("section")
	}

	if section != "" {
		logMessage(DEBUG, fmt.Sprintf("GetHomeGalleryImages: Fetching single image for section: %s", section))
		var item HomeGalleryItem
		err := collection.FindOne(ctx, bson.M{"section": section}).Decode(&item)
		if err != nil {
			logMessage(WARN, fmt.Sprintf("GetHomeGalleryImages: Section %s not found", section))
			http.Error(w, "Section not found", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(item)
		return
	}

	// Default: Return all section images
	logMessage(DEBUG, "GetHomeGalleryImages: Fetching all home gallery images")
	findOptions := options.Find().SetSort(bson.D{{Key: "uploadAt", Value: -1}})
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var gallery []HomeGalleryItem
	cursor.All(ctx, &gallery)
	json.NewEncoder(w).Encode(gallery)
}
