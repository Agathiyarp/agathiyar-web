package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "DeleteUserHandler: Received request to soft delete user")

	vars := mux.Vars(r)
	userMemberID := vars["usermemberid"]
	if userMemberID == "" {
		logMessage(WARN, "DeleteUserHandler: Missing usermemberid in URL")
		http.Error(w, "User Member ID is required", http.StatusBadRequest)
		return
	}

	logMessage(DEBUG, fmt.Sprintf("DeleteUserHandler: Soft deleting user: %s", userMemberID))

	collection := client.Database(DBName).Collection(UserCollection)
	filter := bson.M{"usermemberid": userMemberID}
	update := bson.M{"$set": bson.M{"isDeleted": true}}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteUserHandler: Failed to soft delete user in MongoDB: %v", err))
		http.Error(w, "Error deleting user", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("DeleteUserHandler: User not found with ID: %s", userMemberID))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	logMessage(INFO, fmt.Sprintf("DeleteUserHandler: Successfully soft deleted user: %s", userMemberID))
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User deleted successfully"))
}
