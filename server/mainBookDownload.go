package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func downloadBookHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "downloadBookHandler: Received request to download book")

	// Get filename from path parameter
	vars := mux.Vars(r)
	filename := vars["filename"]
	if filename == "" {
		logMessage(WARN, "downloadBookHandler: Filename is required but missing")
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}
	logMessage(INFO, fmt.Sprintf("downloadBookHandler: Requested download for: %s", filename))

	// MongoDB lookup
	collection := client.Database(DBName).Collection(BookCollection)

	var book Book
	err := collection.FindOne(context.TODO(), bson.M{"filename": filename}).Decode(&book)
	if err != nil {
		logMessage(WARN, fmt.Sprintf("downloadBookHandler: Book not found in MongoDB: %v", err))
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	// Check if file exists
	if _, err := os.Stat(book.FilePath); os.IsNotExist(err) {
		logMessage(ERROR, fmt.Sprintf("downloadBookHandler: File not found on disk: %s", book.FilePath))
		http.Error(w, "File not found on server", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("downloadBookHandler: Serving file: %s", book.FilePath))

	// Serve the file as a download
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(book.FilePath))
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", getFileSize(book.FilePath)))

	http.ServeFile(w, r, book.FilePath)
}
func getFileSize(path string) int64 {
	info, err := os.Stat(path)
	if err != nil {
		return 0
	}
	return info.Size()
}
