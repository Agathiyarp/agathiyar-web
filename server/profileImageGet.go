package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func GetProfileImageByUsernameHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "GetProfileImageByUsernameHandler: Received request to fetch profile image")
	params := mux.Vars(r)
	username := params["username"]
	logMessage(DEBUG, fmt.Sprintf("GetProfileImageByUsernameHandler: Fetching profile image for user: %s", username))

	collection := client.Database(DBName).Collection(UserCollection)
	var user bson.M
	err := collection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("GetProfileImageByUsernameHandler: User not found: %s", username))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	imageName, ok := user["profileimage"].(string)
	if !ok || imageName == "" {
		logMessage(WARN, fmt.Sprintf("GetProfileImageByUsernameHandler: Profile image not found for user: %s", username))
		http.Error(w, "Profile image not found", http.StatusNotFound)
		return
	}

	imagePath := filepath.Join(ProfileImagePath, imageName)
	logMessage(DEBUG, fmt.Sprintf("GetProfileImageByUsernameHandler: Serving image from path: %s", imagePath))

	file, err := os.Open(imagePath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("GetProfileImageByUsernameHandler: Image file not found on disk: %s", imagePath))
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	logMessage(INFO, fmt.Sprintf("GetProfileImageByUsernameHandler: Successfully served profile image for user: %s", username))

	w.Header().Set("Content-Type", "image/jpeg") // optionally detect MIME type
	io.Copy(w, file)
}
