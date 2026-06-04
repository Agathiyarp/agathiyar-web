package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func UploadProfileImageHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UploadProfileImageHandler: Received request to upload profile image")
	params := mux.Vars(r)
	username := params["username"]
	logMessage(DEBUG, fmt.Sprintf("UploadProfileImageHandler: Upload request for username: %s", username))

	err := r.ParseMultipartForm(20 << 20) // Max 20 MB
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadProfileImageHandler: Error parsing form data: %v", err))
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadProfileImageHandler: Error retrieving file: %v", err))
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// MongoDB collection
	collection := client.Database(DBName).Collection(UserCollection)

	// 🔍 Find existing user to check old image
	var userDoc bson.M
	err = collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&userDoc)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("UploadProfileImageHandler: User not found: %s", username))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// 🧹 Delete old profile image if exists
	if oldImage, ok := userDoc["profileimage"].(string); ok && oldImage != "" {
		oldImagePath := filepath.Join(ProfileImagePath, oldImage)
		if _, err := os.Stat(oldImagePath); err == nil {
			if err := os.Remove(oldImagePath); err != nil {
				logMessage(WARN, fmt.Sprintf("UploadProfileImageHandler: Failed to delete old image %s: %v", oldImagePath, err))
			} else {
				logMessage(DEBUG, fmt.Sprintf("UploadProfileImageHandler: Deleted old image: %s", oldImagePath))
			}
		}
	}

	// 📛 Generate a unique filename for new image
	filename := fmt.Sprintf("%s_%d%s", username, time.Now().Unix(), filepath.Ext(handler.Filename))
	filePath := filepath.Join(ProfileImagePath, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadProfileImageHandler: Error creating file %s: %v", filePath, err))
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadProfileImageHandler: Error copying file content: %v", err))
		http.Error(w, "Error copying file", http.StatusInternalServerError)
		return
	}

	// 📝 Update MongoDB with new filename
	update := bson.M{"$set": bson.M{"profileimage": filename}}
	_, err = collection.UpdateOne(context.TODO(), bson.M{"username": username}, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadProfileImageHandler: Error updating profile image in DB: %v", err))
		http.Error(w, "Error updating profile image in DB", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("UploadProfileImageHandler: Image uploaded successfully for user: %s", username))

	// ✅ Send response
	response := map[string]string{
		"message":  "Image uploaded successfully",
		"imageUrl": fmt.Sprintf("https://www.agathiyarpyramid.org/api/user/profile-image/%s", username),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
