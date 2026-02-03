package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// userByIDHandler retrieves a single user from the database based on user ID
func userByIDHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "userByIDHandler: Received request to fetch user by ID")
	vars := mux.Vars(r)
	userID := vars["usermemberid"]

	collection := client.Database(DBName).Collection(UserCollection)
	logMessage(DEBUG, fmt.Sprintf("userByIDHandler: Fetching user for userID: %s", userID))

	if err := client.Ping(context.TODO(), nil); err != nil {
		logMessage(ERROR, fmt.Sprintf("userByIDHandler: Database ping failed: %v", err))
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Query using "usermemberid" field
	var responseUser RegisterUser
	err := collection.FindOne(context.TODO(), bson.M{"usermemberid": userID}).Decode(&responseUser)
	if err == mongo.ErrNoDocuments {
		logMessage(WARN, fmt.Sprintf("userByIDHandler: User not found for usermemberid: %s", userID))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		logMessage(ERROR, fmt.Sprintf("userByIDHandler: Error finding user: %v", err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := AllUserResponse{
		Name:        responseUser.Name,
		Email:       responseUser.Email,
		PhoneNumber: responseUser.PhoneNumber,
		Country:     responseUser.Country,
		Username:    responseUser.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		logMessage(ERROR, fmt.Sprintf("userByIDHandler: Error encoding response: %v", err))
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("userByIDHandler: Successfully served user data for userID: %s", userID))
}
