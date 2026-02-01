package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func deleteBookHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "deleteBookHandler: Received request to delete book")

	// Allow CORS for DELETE method
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logMessage(ERROR, fmt.Sprintf("deleteBookHandler: Error decoding delete request: %v", err))
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		logMessage(WARN, "deleteBookHandler: Missing book ID")
		http.Error(w, "Book ID is required", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("deleteBookHandler: Invalid book ID format: %v", err))
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("deleteBookHandler: Deleting book with ID: %s", req.ID))

	collection := client.Database(DBName).Collection(BookCollection)

	// Find the book first to get file paths
	var book Book
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&book)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("deleteBookHandler: Book not found: %v", err))
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	// 1. Delete PDF file
	if book.FilePath != "" {
		if err := os.Remove(book.FilePath); err != nil {
			logMessage(WARN, fmt.Sprintf("deleteBookHandler: Failed to delete PDF file %s: %v", book.FilePath, err))
		} else {
			logMessage(INFO, fmt.Sprintf("deleteBookHandler: Deleted PDF file: %s", book.FilePath))
		}
	}

	// 2. Delete Cover Image file
	if book.CoverImgPath != "" {
		if err := os.Remove(book.CoverImgPath); err != nil {
			logMessage(WARN, fmt.Sprintf("deleteBookHandler: Failed to delete cover image file %s: %v", book.CoverImgPath, err))
		} else {
			logMessage(INFO, fmt.Sprintf("deleteBookHandler: Deleted cover image file: %s", book.CoverImgPath))
		}
	}

	// 3. Remove from MongoDB
	_, err = collection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("deleteBookHandler: Failed to delete book from MongoDB: %v", err))
		http.Error(w, "Failed to delete book record", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("deleteBookHandler: Book record deleted from MongoDB: %s", book.FileName))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Book deleted successfully"})
}
