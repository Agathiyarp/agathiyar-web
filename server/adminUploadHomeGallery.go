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

func UploadHomeGalleryImages(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UploadHomeGalleryImages: Received request to upload gallery image")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	err := r.ParseMultipartForm(100 << 20) // 100MB
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadHomeGalleryImages: Error parsing multipart form: %v", err))
		http.Error(w, "Error parsing multipart form: "+err.Error(), http.StatusBadRequest)
		return
	}

	section := r.FormValue("section")
	if section == "" {
		logMessage(WARN, "UploadHomeGalleryImages: Section name is missing")
		http.Error(w, "Section name is required", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		logMessage(WARN, "UploadHomeGalleryImages: No image found in 'image' field, checking 'images[]'")
		// Fallback to images[] if needed
		files := r.MultipartForm.File["images[]"]
		if len(files) == 0 {
			http.Error(w, "No image found", http.StatusBadRequest)
			return
		}
		header = files[0]
		file, err = header.Open()
		if err != nil {
			http.Error(w, "Error opening image", http.StatusInternalServerError)
			return
		}
	}
	defer file.Close()

	// Physical folder where files are stored
	savePath := HomeGalleryPath
	if _, err := os.Stat(savePath); os.IsNotExist(err) {
		logMessage(INFO, fmt.Sprintf("UploadHomeGalleryImages: Directory %s does not exist. Creating...", savePath))
		os.MkdirAll(savePath, 0755)
	}

	collection := client.Database(DBName).Collection(HomeGalleryCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// 1. Check if an image for this section already exists
	var existingItem HomeGalleryItem
	err = collection.FindOne(ctx, bson.M{"section": section}).Decode(&existingItem)
	if err == nil {
		// Existing record found, delete the old physical file
		oldFilePath := filepath.Join(savePath, existingItem.FileName)
		if err := os.Remove(oldFilePath); err != nil {
			logMessage(WARN, fmt.Sprintf("UploadHomeGalleryImages: Failed to delete old file %s: %v", oldFilePath, err))
		} else {
			logMessage(INFO, fmt.Sprintf("UploadHomeGalleryImages: Deleted old file: %s", oldFilePath))
		}
		// Delete old record from DB (we will re-insert/upsert)
		_, _ = collection.DeleteOne(ctx, bson.M{"section": section})
	}

	// 2. Generate filename using Section name
	extension := filepath.Ext(header.Filename)
	uniqueName := section + extension
	targetPath := filepath.Join(savePath, uniqueName)

	dstFile, err := os.Create(targetPath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadHomeGalleryImages: Error creating file %s: %v", targetPath, err))
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, file)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadHomeGalleryImages: Error copying file content: %v", err))
		http.Error(w, "Error saving file content", http.StatusInternalServerError)
		return
	}

	// 3. Insert/Update record in MongoDB
	publicPath := "./HomeGalleryall/" + uniqueName
	item := HomeGalleryItem{
		Name:     section, // Using section as name too as per request implies section is key
		Section:  section,
		FileName: uniqueName,
		FilePath: publicPath,
		UploadAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, item)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UploadHomeGalleryImages: Error inserting DB record: %v", err))
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("UploadHomeGalleryImages: Successfully uploaded image for section: %s", section))

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Upload completed",
		"data":    item,
	})
}
