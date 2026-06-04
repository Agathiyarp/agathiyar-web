package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func insertRoomDailyAvailability() {
	logMessage(INFO, "insertRoomDailyAvailability: Starting daily room availability insertion process")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db := client.Database(DBName)
	collection := db.Collection(DailyAvailCollection)

	startDate := time.Now().Truncate(24 * time.Hour)
	endDate := startDate.AddDate(0, 3, 0)

	var docs []interface{}
	var existingDates []string
	var newDates []string

	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")

		// Check if date exists
		count, err := collection.CountDocuments(ctx, bson.M{"date": dateStr})
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("insertRoomDailyAvailability: Failed to check date %s: %v", dateStr, err))
			continue
		}

		if count == 0 { // Not present, add
			docs = append(docs, bson.M{
				"date":      dateStr,
				"agathiyar": 14,
				"patriji":   20,
				"dormitory": 35,
			})
			newDates = append(newDates, dateStr)
		} else { // Already exists
			existingDates = append(existingDates, dateStr)
		}
	}

	// Insert only missing ones
	if len(docs) > 0 {
		_, err := collection.InsertMany(ctx, docs)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("insertRoomDailyAvailability: Failed to insert records: %v", err))
			return
		}
	}

	// Print results
	if len(existingDates) > 0 {
		logMessage(DEBUG, fmt.Sprintf("insertRoomDailyAvailability: Dates already present: %v", existingDates))
	} else {
		logMessage(DEBUG, "insertRoomDailyAvailability: No dates were already present.")
	}

	if len(newDates) > 0 {
		logMessage(INFO, fmt.Sprintf("insertRoomDailyAvailability: Newly added dates: %v", newDates))
	} else {
		logMessage(INFO, "insertRoomDailyAvailability: No new dates added, all were already present.")
	}
	logMessage(INFO, "insertRoomDailyAvailability: Completed daily room availability insertion process")
}
