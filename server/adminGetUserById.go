package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func getUserByAnyIdentifierHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "getUserByAnyIdentifierHandler: Received request to search user")
	vars := mux.Vars(r)
	input := vars["input"]

	if input == "" {
		logMessage(WARN, "getUserByAnyIdentifierHandler: Input is missing")
		http.Error(w, "Input is required in the path (username, phonenumber, or usermemberid)", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("getUserByAnyIdentifierHandler: Searching user for input: %s", input))

	collection := client.Database(DBName).Collection(UserCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Match input against any of the three fields
	filter := bson.M{
		"$or": bson.A{
			bson.M{"phonenumber": input},
			bson.M{"usermemberid": input},
			bson.M{"username": input},
		},
	}

	var user AllUserResponse
	err := collection.FindOne(ctx, filter).Decode(&user)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		logMessage(WARN, fmt.Sprintf("getUserByAnyIdentifierHandler: User not found for input: %s, Error: %v", input, err))
		// Return empty JSON object
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{}`))
		return
	}

	logMessage(INFO, fmt.Sprintf("getUserByAnyIdentifierHandler: Successfully found user: %s", user.Username))
	json.NewEncoder(w).Encode(user)
}
