package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// Log levels
const (
	INFO  = "INFO"
	ERROR = "ERROR"
	WARN  = "WARN"
	DEBUG = "DEBUG"
)

// ANSI colors for console logs
var logColors = map[string]string{
	INFO:  "\033[34m", // Blue
	ERROR: "\033[31m", // Red
	WARN:  "\033[33m", // Yellow
	DEBUG: "\033[36m", // Cyan
}

// Logger variables
var (
	logger   *log.Logger
	logFile  *os.File
	logError error
)

// init initializes the log file and logger
func init() {
	logFile, logError = os.OpenFile("AgathiyarLog.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if logError != nil {
		fmt.Printf("Failed to open log file: %v\n", logError)
		os.Exit(1)
	}
	logger = log.New(logFile, "", log.Ldate|log.Ltime)
}

// logMessage writes logs with level, file, line, and function
func logMessage(level, msg string) {
	// Get caller info (2 stack levels up: skip logMessage + its caller)
	pc, file, line, ok := runtime.Caller(2)
	funcName := "unknown"
	if ok {
		fn := runtime.FuncForPC(pc)
		if fn != nil {
			funcName = fn.Name()
		}
	}

	// Short file name
	shortFile := filepath.Base(file)

	// Apply color for console logs
	color, ok := logColors[level]
	if !ok {
		color = "\033[0m" // Reset
	}

	// Console log with colors
	fmt.Printf("%s[%s] %s | %s:%d %s()\033[0m\n",
		color, level, msg, shortFile, line, funcName)

	// File log (no colors)
	logger.Printf("[%s] %s | %s:%d %s()",
		level, msg, shortFile, line, funcName)
}

// Main function start
func main() {
	defer func() {
		if logFile != nil {
			_ = logFile.Close()
		}
	}()

	// Recover from crashes
	defer func() {
		if r := recover(); r != nil {
			logMessage(ERROR, fmt.Sprintf("Application crashed: %v", r))
		}
	}()

	dbConnectionStart()
	// ✅ ensure Mongo client disconnect
	defer client.Disconnect(context.TODO())

	router := mux.NewRouter()
	insertRoomDailyAvailability()

	router.HandleFunc("/api/register", registerHandler).Methods("POST")
	router.HandleFunc("/api/login", loginHandler).Methods("POST")
	router.HandleFunc("/api/logout", logoutHandler).Methods("POST")
	router.HandleFunc("/api/forgot-password", forgotPasswordHandler).Methods("POST")
	router.HandleFunc("/api/reset-password", resetPasswordHandler).Methods("POST")
	router.HandleFunc("/api/users", GetAllUsersHandler)
	router.HandleFunc("/api/users/{usermemberid}", userByIDHandler).Methods("GET")
	router.HandleFunc("/api/users/{usermemberid}", UpdateUserByIDHandler).Methods("PUT")
	router.HandleFunc("/api/users/{usermemberid}", DeleteUserHandler).Methods("DELETE")

	// adding new events and get event based on id
	router.HandleFunc("/api/add-event", addEventHandler).Methods("POST")
	router.HandleFunc("/api/get-event/{id}", getEventHandler).Methods("GET")
	router.HandleFunc("/api/get-events", getAllEventsHandler).Methods("GET")
	router.HandleFunc("/api/event/user/register", registerEvent).Methods("POST")
	router.HandleFunc("/api/delete-event/{id}", deleteEventHandler).Methods("DELETE")
	router.HandleFunc("/api/events/filter/{startdate}/{enddate}", getEventsByDateRange).Methods("GET")
	router.HandleFunc("/api/eventregistrations", getAllEventRegistrations).Methods("GET")

	// Route for adding bookings
	router.HandleFunc("/api/addbooking", addBooking).Methods("POST")
	router.HandleFunc("/api/roombooking", bookingSummary).Methods("POST")
	router.HandleFunc("/api/getBookingRecords", getBookingRecords).Methods("GET")

	router.HandleFunc("/api/bookings", GetAllBookings).Methods("GET")
	router.HandleFunc("/api/bookings/{usermemberid}", GetBookingsByMemberID).Methods("GET")

	router.HandleFunc("/api/booking/update-booking-status", UpdateBookingStatus).Methods("POST")
	router.HandleFunc("/api/user/{input}", getUserByAnyIdentifierHandler).Methods("GET")

	// ✅ Add this for update user API
	router.HandleFunc("/api/updateuser", UpdateUserByFlexibleIdentifier).Methods("PUT")

	// image
	router.HandleFunc("/api/upload-image", uploadImageHandler).Methods("POST")

	// Routes
	router.HandleFunc("/api/videos", AddVideo).Methods("POST")
	router.HandleFunc("/api/videos", GetVideos).Methods("GET")

	router.HandleFunc("/api/uploadbook", uploadBookHandler).Methods("POST")
	router.HandleFunc("/api/books", getBooksHandler).Methods("GET")
	router.HandleFunc("/api/downloadbook/{filename}", downloadBookHandler).Methods("GET")

	router.HandleFunc("/api/credits", getAllCredits).Methods("GET")

	router.HandleFunc("/api/user/profile-image/{username}", GetProfileImageByUsernameHandler).Methods("GET")
	router.HandleFunc("/api/user/upload-profile-image/{username}", UploadProfileImageHandler).Methods("POST")

	router.HandleFunc("/api/addschedule", AddScheduleHandler).Methods("POST")
	router.HandleFunc("/api/getschedules", GetAllSchedulesHandler).Methods("GET")
	router.HandleFunc("/api/updateschedule", UpdateScheduleHandler).Methods("POST")
	router.HandleFunc("/api/deleteschedule", DeleteScheduleHandler).Methods("POST")

	router.HandleFunc("/api/update-credits/{usermemberid}", UpdateCredits).Methods("POST")

	router.HandleFunc("/api/dailyrooms", getRoomAvailabilityByDateRange).Methods("GET")
	router.HandleFunc("/api/adddailyroom", addDailyRoomEntry).Methods("POST")

	router.HandleFunc("/api/upload-gallery-images", UploadGalleryImages).Methods("POST")
	router.HandleFunc("/api/get-gallery-images", GetGalleryImages).Methods("GET")

	router.HandleFunc("/api/upload-home-gallery-images", UploadHomeGalleryImages).Methods("POST")
	router.HandleFunc("/api/home/images", GetHomeGalleryImages).Methods("GET")
	router.HandleFunc("/api/home/images/{section}", GetHomeGalleryImages).Methods("GET")
	router.HandleFunc("/api/delete-home-gallery-section/{section}", DeleteHomeGalleryImage).Methods("DELETE")

	router.HandleFunc("/api/manualbooking", bookingManual).Methods("POST")

	router.HandleFunc("/api/manualbooking", getBooking).Methods("GET")

	router.HandleFunc("/api/dailyavailability", getDailyAvailability).Methods("GET")
	// Routes
	router.HandleFunc("/api/create-order", createOrder).Methods("POST")
	router.HandleFunc("/api/create-qr", createQR).Methods("POST")

	// Delete routes
	router.HandleFunc("/api/deletebook", deleteBookHandler).Methods("DELETE")
	router.HandleFunc("/api/delete-gallery-image/{id}", DeleteGalleryImage).Methods("DELETE")
	router.HandleFunc("/api/videos/{id}", DeleteVideo).Methods("DELETE")

	// allowedOrigins := handlers.AllowedOrigins([]string{"https://213.210.37.35:3000", "https://213.210.37.35:8080", "https://www.agathiyarpyramid.org", "http://www.agathiyarpyramid.org", "http://localhost:3000", "http://localhost:8080"})
	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	logMessage(INFO, "Server starting on port 8080")

	if err := http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router)); err != nil {
		logMessage(ERROR, fmt.Sprintf("Could not start server: %v", err))
	}
}
