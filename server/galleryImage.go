package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func uploadImageHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "uploadImageHandler: Received request to upload image")
	err := r.ParseMultipartForm(15 << 20) // 15 MB max size
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadImageHandler: Invalid form data: %v", err))
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadImageHandler: Image file is required: %v", err))
		http.Error(w, "Image file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// ✅ Correct upload directory
	uploadDir := UploadAllPath
	logMessage(DEBUG, fmt.Sprintf("uploadImageHandler: Upload directory: %s", uploadDir))

	// Create directory if not exist
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			logMessage(ERROR, fmt.Sprintf("uploadImageHandler: Cannot create upload directory: %v", err))
			http.Error(w, "Cannot create upload directory", http.StatusInternalServerError)
			return
		}
	}

	// Unique filename
	filename := primitive.NewObjectID().Hex() + filepath.Ext(handler.Filename)
	savePath := filepath.Join(uploadDir, filename)
	logMessage(DEBUG, fmt.Sprintf("uploadImageHandler: Saving image to: %s", savePath))

	// Save image
	outFile, err := os.Create(savePath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadImageHandler: Failed to create file: %v", err))
		http.Error(w, "Failed to save image", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, file); err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadImageHandler: Failed to write image content: %v", err))
		http.Error(w, "Failed to write image", http.StatusInternalServerError)
		return
	}

	// ✅ Public URL
	imageURL := fmt.Sprintf("https://www.agathiyarpyramid.org/uploadall/%s", filename)
	logMessage(INFO, fmt.Sprintf("uploadImageHandler: Image uploaded successfully. URL: %s", imageURL))

	// Response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"imageUrl":  imageURL,
		"imagePath": savePath,
	})
}
