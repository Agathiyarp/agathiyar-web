package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func uploadBookHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "uploadBookHandler: Received request to upload book")

	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		logMessage(DEBUG, "uploadBookHandler: Handled OPTIONS preflight request")
		w.WriteHeader(http.StatusOK)
		return
	}

	logMessage(DEBUG, "uploadBookHandler: Parsing multipart form data")
	if err := r.ParseMultipartForm(0); err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Error parsing multipart form: %v", err))
		http.Error(w, "Malformed form data", http.StatusBadRequest)
		return
	}

	name := r.FormValue("name")
	if name == "" {
		logMessage(WARN, "uploadBookHandler: Field 'name' is missing")
		http.Error(w, "Field 'name' is required", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("uploadBookHandler: Book name: %s", name))

	uploadDir := BooksPath

	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		logMessage(INFO, fmt.Sprintf("uploadBookHandler: Directory %s does not exist. Creating...", uploadDir))
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Failed to create directory: %v", err))
			http.Error(w, "Failed to prepare upload directory", http.StatusInternalServerError)
			return
		}
	}

	// MongoDB collection
	collection := client.Database(DBName).Collection(BookCollection)

	// Check if a book with the same name exists
	var existing Book
	err := collection.FindOne(context.TODO(), bson.M{"filename": name}).Decode(&existing)
	if err == nil {
		logMessage(INFO, fmt.Sprintf("uploadBookHandler: Book '%s' already exists. Replacing files.", name))
		// Delete old files if they exist
		if existing.FilePath != "" {
			_ = os.Remove(existing.FilePath)
			logMessage(DEBUG, fmt.Sprintf("uploadBookHandler: Removed old PDF: %s", existing.FilePath))
		}
		if existing.CoverImgPath != "" {
			_ = os.Remove(existing.CoverImgPath)
			logMessage(DEBUG, fmt.Sprintf("uploadBookHandler: Removed old image: %s", existing.CoverImgPath))
		}
	}

	// Unique filenames using timestamp
	timestamp := time.Now().UnixNano()
	pdfFilename := fmt.Sprintf("%d_%s", timestamp, filepath.Base(r.FormValue("name")+".pdf"))
	pdfPath := filepath.Join(uploadDir, pdfFilename)

	// --- PDF File Upload ---
	file, _, err := r.FormFile("file")
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadBookHandler: PDF file is missing: %v", err))
		http.Error(w, "PDF file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	dstFile, err := os.Create(pdfPath)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Unable to create PDF file: %v", err))
		http.Error(w, "Unable to save PDF", http.StatusInternalServerError)
		return
	}
	defer dstFile.Close()
	if _, err := io.Copy(dstFile, file); err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Failed to save PDF: %v", err))
		http.Error(w, "Failed to write PDF", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("uploadBookHandler: PDF saved to: %s", pdfPath))

	// --- Image File Upload (Optional) ---
	var imgPath string
	image, imgHeader, err := r.FormFile("image")
	if err == nil {
		defer image.Close()

		imgFilename := fmt.Sprintf("%d_%s", timestamp, imgHeader.Filename)
		imgPath = filepath.Join(uploadDir, imgFilename)

		dstImg, err := os.Create(imgPath)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Unable to create image file: %v", err))
			http.Error(w, "Unable to save image", http.StatusInternalServerError)
			return
		}
		defer dstImg.Close()
		if _, err := io.Copy(dstImg, image); err != nil {
			logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Failed to save image: %v", err))
			http.Error(w, "Failed to write image", http.StatusInternalServerError)
			return
		}
		logMessage(INFO, fmt.Sprintf("uploadBookHandler: Image saved to: %s", imgPath))
	} else {
		logMessage(DEBUG, "uploadBookHandler: No cover image uploaded")
	}

	// Save metadata to MongoDB
	book := Book{
		FileName:     name,
		FilePath:     pdfPath,
		CoverImgPath: imgPath,
	}
	filter := bson.M{"filename": name}
	update := bson.M{
		"$set": book,
	}
	opts := options.Update().SetUpsert(true)
	res, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("uploadBookHandler: Failed to upsert book metadata: %v", err))
		http.Error(w, "Failed to save book metadata", http.StatusInternalServerError)
		return
	}

	if res.MatchedCount > 0 {
		logMessage(INFO, fmt.Sprintf("uploadBookHandler: Existing book '%s' updated in MongoDB", name))
	} else {
		logMessage(INFO, fmt.Sprintf("uploadBookHandler: New book '%s' inserted into MongoDB", name))
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book uploaded and saved successfully"))
}
