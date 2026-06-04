package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddScheduleHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "AddScheduleHandler: Received request to add schedule")
	w.Header().Set("Content-Type", "application/json")

	var schedule Schedule

	// Decode JSON body
	if err := json.NewDecoder(r.Body).Decode(&schedule); err != nil {
		logMessage(ERROR, fmt.Sprintf("AddScheduleHandler: Failed to decode request body: %v", err))
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("AddScheduleHandler: Decoded schedule: %+v", schedule))

	// Validate input
	if schedule.StartDate == "" || schedule.EndDate == "" || schedule.CreatedDate == "" {
		logMessage(WARN, "AddScheduleHandler: Missing required fields (startDate, endDate, or createdDate)")
		http.Error(w, "startDate, endDate, and createdDate are required", http.StatusBadRequest)
		return
	}

	// Check DB connection
	if client == nil {
		logMessage(ERROR, "AddScheduleHandler: Database connection is not initialized")
		http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
		return
	}

	collection := client.Database(DBName).Collection(ScheduleCollection)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Insert document with client-sent createdDate
	result, err := collection.InsertOne(ctx, bson.M{
		"startDate":   schedule.StartDate,
		"endDate":     schedule.EndDate,
		"enable":      schedule.Enable,
		"createdDate": schedule.CreatedDate,
	})

	if err != nil {
		logMessage(ERROR, fmt.Sprintf("AddScheduleHandler: Failed to insert schedule: %v", err))
		http.Error(w, "Failed to insert schedule", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("AddScheduleHandler: Schedule added successfully with ID: %v", result.InsertedID))

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "✅ Schedule added successfully",
	})
}

// GetAllSchedulesHandler handles GET /api/getschedules
func GetAllSchedulesHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "GetAllSchedulesHandler: Received request to fetch all schedules")
	w.Header().Set("Content-Type", "application/json")

	// Ensure DB connection is active
	if client == nil {
		logMessage(ERROR, "GetAllSchedulesHandler: Database connection is not initialized")
		http.Error(w, "Database connection is not initialized", http.StatusInternalServerError)
		return
	}

	// Access collection
	collection := client.Database(DBName).Collection(ScheduleCollection)

	// Context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all documents
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllSchedulesHandler: Failed to fetch schedules: %v", err))
		http.Error(w, "Failed to fetch schedules", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var schedules []bson.M
	if err := cursor.All(ctx, &schedules); err != nil {
		logMessage(ERROR, fmt.Sprintf("GetAllSchedulesHandler: Failed to decode schedules: %v", err))
		http.Error(w, "Failed to decode schedules", http.StatusInternalServerError)
		return
	}
	logMessage(INFO, fmt.Sprintf("GetAllSchedulesHandler: Successfully fetched %d schedules", len(schedules)))

	// Return all schedules
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(schedules)
}

func UpdateScheduleHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "UpdateScheduleHandler: Received request to update schedule")
	w.Header().Set("Content-Type", "application/json")

	var schedule Scheduleupdate

	// Decode JSON body
	if err := json.NewDecoder(r.Body).Decode(&schedule); err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateScheduleHandler: Failed to decode update payload: %v", err))
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("UpdateScheduleHandler: Updating schedule ID: %s", schedule.ID))

	if schedule.ID == "" {
		logMessage(WARN, "UpdateScheduleHandler: Missing schedule ID")
		http.Error(w, "_id is required", http.StatusBadRequest)
		return
	}

	// Convert _id string to ObjectID
	objID, err := primitive.ObjectIDFromHex(schedule.ID)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateScheduleHandler: Invalid _id format: %v", err))
		http.Error(w, "Invalid _id format", http.StatusBadRequest)
		return
	}

	// Check DB connection
	if client == nil {
		logMessage(ERROR, "UpdateScheduleHandler: Database not initialized")
		http.Error(w, "Database not initialized", http.StatusInternalServerError)
		return
	}

	collection := client.Database(DBName).Collection(ScheduleCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build the update
	update := bson.M{
		"$set": bson.M{
			"startDate":   schedule.StartDate,
			"endDate":     schedule.EndDate,
			"enable":      schedule.Enable,
			"createdDate": schedule.CreatedDate,
		},
	}

	// Perform the update
	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("UpdateScheduleHandler: Failed to update schedule: %v", err))
		http.Error(w, "Failed to update schedule", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		logMessage(WARN, fmt.Sprintf("UpdateScheduleHandler: Schedule not found with ID: %s", schedule.ID))
		http.Error(w, "Schedule not found", http.StatusNotFound)
		return
	}
	logMessage(INFO, fmt.Sprintf("UpdateScheduleHandler: Schedule updated successfully. ID: %s", schedule.ID))

	json.NewEncoder(w).Encode(map[string]string{
		"message": "✅ Schedule updated successfully",
	})
}

func DeleteScheduleHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "DeleteScheduleHandler: Received request to delete schedule")
	w.Header().Set("Content-Type", "application/json")

	var req DeleteRequest

	// Parse request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteScheduleHandler: Failed to decode delete request: %v", err))
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	logMessage(DEBUG, fmt.Sprintf("DeleteScheduleHandler: Deleting schedule ID: %s", req.ID))

	if req.ID == "" {
		logMessage(WARN, "DeleteScheduleHandler: Missing schedule ID")
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(req.ID)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteScheduleHandler: Invalid id format: %v", err))
		http.Error(w, "Invalid id format", http.StatusBadRequest)
		return
	}

	if client == nil {
		logMessage(ERROR, "DeleteScheduleHandler: Database connection not initialized")
		http.Error(w, "Database connection not initialized", http.StatusInternalServerError)
		return
	}

	collection := client.Database(DBName).Collection(ScheduleCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Delete document
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("DeleteScheduleHandler: Failed to delete schedule: %v", err))
		http.Error(w, "Failed to delete schedule", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		logMessage(WARN, fmt.Sprintf("DeleteScheduleHandler: No schedule found with ID: %s", req.ID))
		http.Error(w, "No schedule found with given id", http.StatusNotFound)
		return
	}
	logMessage(INFO, fmt.Sprintf("DeleteScheduleHandler: Schedule deleted successfully. ID: %s", req.ID))

	json.NewEncoder(w).Encode(map[string]string{
		"message": "✅ Schedule deleted successfully",
	})
}
