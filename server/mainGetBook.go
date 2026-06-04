package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"go.mongodb.org/mongo-driver/bson"
)

func getBooksHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getBooksHandler: Received request to fetch books")

	collection := client.Database(DBName).Collection(BookCollection)

	// Filter: Only books where filename and filepath exist and are not empty
	filter := bson.M{
		"filename": bson.M{"$ne": ""},
		"filepath": bson.M{"$ne": ""},
	}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("getBooksHandler: Failed to fetch books from MongoDB: %v", err))
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}
	defer func() {
		if err := cursor.Close(context.TODO()); err != nil {
			logMessage(WARN, fmt.Sprintf("getBooksHandler: Failed to close cursor: %v", err))
		}
	}()

	var books []Book
	if err := cursor.All(context.TODO(), &books); err != nil {
		logMessage(ERROR, fmt.Sprintf("getBooksHandler: Error decoding books: %v", err))
		http.Error(w, "Error decoding books", http.StatusInternalServerError)
		return
	}

	// Optionally check if file physically exists on disk
	validBooks := make([]Book, 0)
	for _, b := range books {
		if _, err := os.Stat(b.FilePath); err == nil {
			validBooks = append(validBooks, b)
		} else {
			logMessage(WARN, fmt.Sprintf("getBooksHandler: Skipping book with missing file: %s", b.FilePath))
		}
	}

	logMessage(INFO, fmt.Sprintf("getBooksHandler: Successfully fetched %d valid books (IDs included)", len(validBooks)))

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(validBooks); err != nil {
		logMessage(ERROR, fmt.Sprintf("getBooksHandler: Failed to encode JSON response: %v", err))
		http.Error(w, "Failed to return books", http.StatusInternalServerError)
	}
}
