package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func addBooking(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "addBooking: Received request to add booking")
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("addBooking: Failed to parse multipart form: %v", err))
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	form := r.MultipartForm

	getFormValue := func(key string) string {
		if v, ok := form.Value[key]; ok && len(v) > 0 {
			return v[0]
		}
		return ""
	}

	parseInt := func(key string) int {
		val, _ := strconv.Atoi(getFormValue(key))
		return val
	}

	// Create directory for images
	baseDir := BuildPath
	saveDir := filepath.Join(baseDir, "AddRooms")
	if err := os.MkdirAll(saveDir, os.ModePerm); err != nil {
		logMessage(ERROR, fmt.Sprintf("addBooking: Unable to create image directory %s: %v", saveDir, err))
		http.Error(w, "Unable to create image directory", http.StatusInternalServerError)
		return
	}

	// Save single image
	var singleImagePath string
	singleImageFile, singleImageHeader, err := r.FormFile("image")
	if err == nil && singleImageFile != nil {
		defer singleImageFile.Close()
		singleImagePath, err = saveFileToDir(singleImageFile, singleImageHeader, saveDir)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("addBooking: Failed to save single image: %v", err))
			http.Error(w, "Failed to save single image", http.StatusInternalServerError)
			return
		}
		logMessage(DEBUG, fmt.Sprintf("addBooking: Saved single image: %s", singleImagePath))
	}

	// Save multiple images
	var multipleImagePaths []string
	multipleImageHeaders := form.File["multipleimage"]
	for _, header := range multipleImageHeaders {
		file, err := header.Open()
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("addBooking: Error opening multiple image %s: %v", header.Filename, err))
			continue
		}
		defer file.Close()

		imagePath, err := saveFileToDir(file, header, saveDir)
		if err != nil {
			logMessage(ERROR, fmt.Sprintf("addBooking: Error saving multiple image %s: %v", header.Filename, err))
			continue
		}

		if imagePath != "" {
			multipleImagePaths = append(multipleImagePaths, imagePath)
		}
	}
	logMessage(DEBUG, fmt.Sprintf("addBooking: Saved %d multiple images", len(multipleImagePaths)))

	// Ensure not nil (avoid null JSON)
	if multipleImagePaths == nil {
		multipleImagePaths = []string{}
	}

	roomName := getFormValue("roomname")
	logMessage(DEBUG, fmt.Sprintf("addBooking: Room Name: %s", roomName))

	// Auto-assign room variation
	var roomVariation string
	switch roomName {
	case RoomAgathiyar:
		roomVariation = "Single room"
	case RoomPatriji:
		roomVariation = "Family Room"
	case RoomDormitory:
		roomVariation = "Single Bed"
	default:
		roomVariation = "General"
	}

	// Create BookingAdd object
	booking := BookingAdd{
		ID:                         primitive.NewObjectID(),
		RoomName:                   roomName,
		SingleOccupy:               getFormValue("singleoccupy"),
		RoomDescription:            getFormValue("roomdescription"),
		RoomType:                   getFormValue("roomtype"),
		AvailableTotalRooms:        parseInt("availabletotalrooms"),
		RoomVariation:              roomVariation,
		SponsorUserRoomCost:        parseInt("sponsoruserroomcost"),
		NormalUserRoomCost:         parseInt("normaluserroomcost"),
		NormalUserMaintenanceCost:  parseInt("normalusermaintenancecost"),
		SponsorUserMaintenanceCost: parseInt("sponsorusermaintenancecost"),
		MaxRoomAllowed:             parseInt("maxroomallowed"),
		ExtraBed:                   getFormValue("extrabed"),
		ExtraBedCost:               parseInt("extrabedcost"),
		UserRoomLimit:              parseInt("userroomlimit"),
		MaintenanceAlert:           getFormValue("maintenancealert"),
		CreatedDate:                time.Now(),
		ModifiedDate:               time.Now(),
		SingleImage:                singleImagePath,
		MultipleImage:              multipleImagePaths,
	}

	// Insert into MongoDB
	collection := client.Database(DBName).Collection(BookingDetailsCollection)
	_, err = collection.InsertOne(context.TODO(), booking)
	if err != nil {
		logMessage(ERROR, fmt.Sprintf("addBooking: Failed to add booking to MongoDB: %v", err))
		http.Error(w, "Failed to add booking", http.StatusInternalServerError)
		return
	}

	logMessage(INFO, fmt.Sprintf("addBooking: Booking added successfully with ID: %s", booking.ID.Hex()))

	// Prepare response
	response := map[string]interface{}{
		"message":                    "Booking added successfully",
		"roomname":                   booking.RoomName,
		"singleoccupy":               booking.SingleOccupy,
		"roomdescription":            booking.RoomDescription,
		"roomtype":                   booking.RoomType,
		"availabletotalrooms":        booking.AvailableTotalRooms,
		"roomvariation":              booking.RoomVariation,
		"sponsoruserroomcost":        booking.SponsorUserRoomCost,
		"normaluserroomcost":         booking.NormalUserRoomCost,
		"normalusermaintenancecost":  booking.NormalUserMaintenanceCost,
		"sponsorusermaintenancecost": booking.SponsorUserMaintenanceCost,
		"maxroomallowed":             booking.MaxRoomAllowed,
		"extrabed":                   booking.ExtraBed,
		"extrabedcost":               booking.ExtraBedCost,
		"userroomlimit":              booking.UserRoomLimit,
		"maintenancealert":           booking.MaintenanceAlert,
		"image":                      booking.SingleImage,
		"multipleimage":              booking.MultipleImage,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}
