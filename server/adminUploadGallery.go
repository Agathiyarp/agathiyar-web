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

	"go.mongodb.org/mongo-driver/bson"
)

func UploadGalleryImages(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UploadGalleryImages: Received request to upload gallery images")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	err := r.ParseMultipartForm(100 << 20) // 100MB
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadGalleryImages: Error parsing multipart form: %v", err))
		http.Error(w, "Error parsing multipart form: "+err.Error(), http.StatusBadRequest)
		return
	}

	imageFiles := r.MultipartForm.File["images[]"]
	imageNames := r.MultipartForm.Value["names[]"]

	if len(imageFiles) != len(imageNames) {
		logMessage(WARN, "UploadGalleryImages: Mismatched image and name count")
		http.Error(w, "Mismatched image and name count", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("UploadGalleryImages: Processing %d images", len(imageFiles)))

	// Physical folder where files are stored
	savePath := GalleryPath
	if _, err := os.Stat(savePath); os.IsNotExist(err) {
		logMessage(INFO, fmt.Sprintf("UploadGalleryImages: Directory %s does not exist. Creating...", savePath))
		os.MkdirAll(savePath, 0755)
	}

	collection := client.Database(DBName).Collection(GalleryCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	var insertedItems []GalleryItem

	for i, fileHeader := range imageFiles {
		srcFile, err := fileHeader.Open()
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("UploadGalleryImages: Error opening file %s: %v", fileHeader.Filename, err))
			continue
		}
		defer srcFile.Close()

		// Generate unique file name (timestamp + original name)
		uniqueName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), fileHeader.Filename)
		targetPath := filepath.Join(savePath, uniqueName) // Full path for saving

		// Optional: check for duplicate
		count, _ := collection.CountDocuments(ctx, bson.M{"filename": uniqueName})
		if count > 0 {
			logMessage(INFO, fmt.Sprintf("UploadGalleryImages: Duplicate file skipped: %s", fileHeader.Filename))
			continue
		}

		dstFile, err := os.Create(targetPath)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("UploadGalleryImages: Error creating file %s: %v", targetPath, err))
			continue
		}
		defer dstFile.Close()

		_, err = io.Copy(dstFile, srcFile)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("UploadGalleryImages: Error copying file content to %s: %v", targetPath, err))
			continue
		}

		// Store public-facing relative path for frontend
		publicPath := "./galleryall/" + uniqueName
		logMessage(DEBUG, fmt.Sprintf("UploadGalleryImages: Processing image name: %s", imageNames[i]))
		item := GalleryItem{
			Name:     imageNames[i],
			FileName: uniqueName,
			FilePath: publicPath, // ✅ relative path, usable in browser
			UploadAt: time.Now(),
		}

		_, err = collection.InsertOne(ctx, item)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("UploadGalleryImages: Error inserting DB record for %s: %v", uniqueName, err))
			continue
		}

		insertedItems = append(insertedItems, item)
	}

	logMessage(INFO, fmt.Sprintf("UploadGalleryImages: Successfully uploaded %d images", len(insertedItems)))

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Upload completed",
		"count":   len(insertedItems),
		"data":    insertedItems,
	})
}
