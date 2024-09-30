package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Models
type User struct {
	Email    string `json:"email" bson:"email" validate:"required,email"`
	Password string `json:"password" bson:"password" validate:"required,min=8"`
}

type Event struct {
	ID        string    `json:"id" bson:"id" validate:"required,alphanum"`
	Name      string    `json:"name" bson:"name" validate:"required,min=3,max=100"`
	Email     string    `json:"email" bson:"email" validate:"required,email"`
	Mobile    string    `json:"mobile" bson:"mobile" validate:"required,len=10"`
	StartDate time.Time `json:"start_date" bson:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" bson:"end_date" validate:"required,gtfield=StartDate"`
}

type Room struct {
	ID        string `json:"id" bson:"id" validate:"required,alphanum"`
	Type      string `json:"type" bson:"type" validate:"required"`
	Capacity  int    `json:"capacity" bson:"capacity" validate:"required,min=1"`
	Available int    `json:"available" bson:"available" validate:"required,min=0"`
}

type Booking struct {
	UserEmail string    `json:"user_email" bson:"user_email" validate:"required,email"`
	RoomID    string    `json:"room_id" bson:"room_id" validate:"required,alphanum"`
	StartDate time.Time `json:"start_date" bson:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" bson:"end_date" validate:"required,gtfield=StartDate"`
	EventID   string    `json:"event_id" bson:"event_id" validate:"required,alphanum"`
}

type OTP struct {
	Email  string `json:"email" bson:"email" validate:"required,email"`
	Mobile string `json:"mobile" bson:"mobile" validate:"required,len=10"`
	Code   string `json:"code" bson:"code" validate:"required,len=6"`
}

type SuperAdmin struct {
	Username string `json:"username" bson:"username" validate:"required"`
	Password string `json:"password" bson:"password" validate:"required,min=8"`
}

// MongoDB collections
var (
	client             *mongo.Client
	usersCollection    *mongo.Collection
	eventsCollection   *mongo.Collection
	roomsCollection    *mongo.Collection
	bookingsCollection *mongo.Collection
	otpsCollection     *mongo.Collection
	validate           *validator.Validate
	store              = sessions.NewCookieStore([]byte("super-secret-key"))
)

// Connect to MongoDB
func connectMongoDB() {
	var err error
	maxRetries := 5
	for i := 0; i < maxRetries; i++ {
		client, err = mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))
		if err == nil {
			break // Successful connection
		}
		log.Printf("Failed to connect to MongoDB, attempt %d/%d: %v", i+1, maxRetries, err)
		time.Sleep(2 * time.Second) // Wait before retrying
	}

	if err != nil {
		log.Fatal("Could not connect to MongoDB after multiple attempts: ", err)
	}

	fmt.Println("DB collection creation")
	// Initialize collections
	usersCollection = client.Database("test").Collection("users")
	eventsCollection = client.Database("test").Collection("events")
	roomsCollection = client.Database("test").Collection("rooms")
	bookingsCollection = client.Database("test").Collection("bookings")
	otpsCollection = client.Database("test").Collection("otps")
	fmt.Println("DB collection created")

	// Verify collections
	collections := []string{"users", "events", "rooms", "bookings", "otps"}
	for _, collectionName := range collections {
		if err := verifyCollection(collectionName); err != nil {
			log.Fatalf("Error verifying collection %s: %v", collectionName, err)
		}
	}
}

func verifyCollection(name string) error {
	// Check if the collection exists by attempting to get its indexes
	collection := client.Database("test").Collection(name)
	_, err := collection.Indexes().List(context.TODO())
	return err
}

// Retry function for database operations
func retry(operation func() error, attempts int, delay time.Duration) error {
	for i := 0; i < attempts; i++ {
		err := operation()
		if err == nil {
			return nil
		}
		log.Printf("Retrying operation: attempt %d/%d failed: %v", i+1, attempts, err)
		time.Sleep(delay)
	}
	return fmt.Errorf("operation failed after %d attempts", attempts)
}

// ValidateInput validates the input against the struct tags
func ValidateInput(input interface{}) error {
	return validate.Struct(input)
}

// GenerateOTP generates a random 6-digit OTP
func GenerateOTP() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// SendOTP simulates sending an OTP to the user
func SendOTP(email, mobile, code string) error {
	log.Printf("Sending OTP %s to email %s and mobile %s", code, email, mobile)
	return nil // Simulate success
}

// Custom error response structure
type ErrorResponse struct {
	Message string `json:"message"`
}

// Helper function to respond with error messages
func respondWithError(w http.ResponseWriter, message string, status int) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(ErrorResponse{Message: message})
}

// RegisterHandler handles user registration
func registerHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(user); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	var count int64
	countErr := retry(func() error {
		var err error
		count, err = usersCollection.CountDocuments(context.TODO(), bson.M{"email": user.Email})
		return err
	}, 3, time.Second)

	if countErr != nil {
		respondWithError(w, "Error checking for existing user", http.StatusInternalServerError)
		return
	}

	if count > 0 {
		respondWithError(w, "User already exists", http.StatusConflict)
		return
	}

	insertErr := retry(func() error {
		_, err := usersCollection.InsertOne(context.TODO(), user)
		return err
	}, 3, time.Second)

	if insertErr != nil {
		respondWithError(w, insertErr.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

// LoginHandler handles user login
func loginHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(user); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	var foundUser User
	err := usersCollection.FindOne(context.TODO(), bson.M{"email": user.Email, "password": user.Password}).Decode(&foundUser)
	if err != nil {
		respondWithError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	session, _ := store.Get(r, "session-name")
	session.Values["user_email"] = user.Email
	err = session.Save(r, w)

	if err != nil {
		respondWithError(w, "Unable to save session", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
}

// LogoutHandler handles user logout
func logoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")
	delete(session.Values, "user_email")
	session.Save(r, w)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logout successful"})
}

// RegisterEventHandler handles event registration
func registerEventHandler(w http.ResponseWriter, r *http.Request) {
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(event); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	insertErr := retry(func() error {
		_, err := eventsCollection.InsertOne(context.TODO(), event)
		return err
	}, 3, time.Second)

	if insertErr != nil {
		respondWithError(w, insertErr.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Event registered successfully"})
}

// RoomBookingHandler handles room bookings
func roomBookingHandler(w http.ResponseWriter, r *http.Request) {
	var booking Booking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(booking); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	var room Room
	err := roomsCollection.FindOne(context.TODO(), bson.M{"id": booking.RoomID}).Decode(&room)
	if err != nil || room.Available <= 0 {
		respondWithError(w, "Room not available", http.StatusConflict)
		return
	}

	otpCode := GenerateOTP()
	if err := SendOTP(booking.UserEmail, booking.UserEmail, otpCode); err != nil {
		respondWithError(w, "Failed to send OTP", http.StatusInternalServerError)
		return
	}

	otp := OTP{
		Email:  booking.UserEmail,
		Mobile: booking.UserEmail,
		Code:   otpCode,
	}
	_, err = otpsCollection.InsertOne(context.TODO(), otp)
	if err != nil {
		respondWithError(w, "Failed to store OTP", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"message": "OTP sent for verification"})
}

// VerifyOTP verifies the provided OTP
func verifyOTP(w http.ResponseWriter, r *http.Request) {
	var otp OTP
	if err := json.NewDecoder(r.Body).Decode(&otp); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	var foundOTP OTP
	err := otpsCollection.FindOne(context.TODO(), bson.M{"email": otp.Email, "code": otp.Code}).Decode(&foundOTP)
	if err != nil {
		respondWithError(w, "Invalid OTP", http.StatusUnauthorized)
		return
	}

	insertErr := retry(func() error {
		_, err := bookingsCollection.InsertOne(context.TODO(), Booking{
			UserEmail: foundOTP.Email,
			RoomID:    foundOTP.Mobile,               // Placeholder
			StartDate: time.Now(),                    // Placeholder
			EndDate:   time.Now().Add(2 * time.Hour), // Placeholder
		})
		return err
	}, 3, time.Second)

	if insertErr != nil {
		respondWithError(w, insertErr.Error(), http.StatusInternalServerError)
		return
	}

	_, _ = otpsCollection.DeleteOne(context.TODO(), bson.M{"email": otp.Email})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking confirmed"})
}

// GetRoomDetailsHandler gets details of a specific room
func getRoomDetailsHandler(w http.ResponseWriter, r *http.Request) {
	roomID := mux.Vars(r)["id"]

	var room Room
	err := roomsCollection.FindOne(context.TODO(), bson.M{"id": roomID}).Decode(&room)
	if err != nil {
		respondWithError(w, "Room not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(room)
}

// GetUserBookingsHandler gets all bookings for a user
func getUserBookingsHandler(w http.ResponseWriter, r *http.Request) {
	email := mux.Vars(r)["email"]

	cursor, err := bookingsCollection.Find(context.TODO(), bson.M{"user_email": email})
	if err != nil {
		respondWithError(w, "Failed to fetch bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var bookings []Booking
	if err = cursor.All(context.TODO(), &bookings); err != nil {
		respondWithError(w, "Failed to decode bookings", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(bookings)
}

// GetUsersHandler gets all registered users
func getUsersHandler(w http.ResponseWriter, r *http.Request) {
	cursor, err := usersCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		respondWithError(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var users []User
	if err = cursor.All(context.TODO(), &users); err != nil {
		respondWithError(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

// GetEventUserCountHandler gets the count of registered users for an event
func getEventUserCountHandler(w http.ResponseWriter, r *http.Request) {
	eventID := mux.Vars(r)["id"]

	count, err := bookingsCollection.CountDocuments(context.TODO(), bson.M{"event_id": eventID})
	if err != nil {
		respondWithError(w, "Failed to fetch user count", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]int{"count": int(count)})
}

// GetEventUsersHandler gets all registered users for a specific event
func getEventUsersHandler(w http.ResponseWriter, r *http.Request) {
	eventID := mux.Vars(r)["id"]

	cursor, err := bookingsCollection.Find(context.TODO(), bson.M{"event_id": eventID})
	if err != nil {
		respondWithError(w, "Failed to fetch event users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var bookings []Booking
	if err = cursor.All(context.TODO(), &bookings); err != nil {
		respondWithError(w, "Failed to decode event users", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(bookings)
}

// CompleteEventHandler marks an event as completed
func completeEventHandler(w http.ResponseWriter, r *http.Request) {
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(event); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	insertErr := retry(func() error {
		_, err := eventsCollection.InsertOne(context.TODO(), event)
		return err
	}, 3, time.Second)

	if insertErr != nil {
		respondWithError(w, insertErr.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Event marked as completed"})
}

// VerifyEventHandler verifies an event using ID and mobile
func verifyEventHandler(w http.ResponseWriter, r *http.Request) {
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	var foundEvent Event
	err := eventsCollection.FindOne(context.TODO(), bson.M{"id": event.ID, "mobile": event.Mobile}).Decode(&foundEvent)
	if err != nil {
		respondWithError(w, "Event not found or mobile does not match", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(foundEvent)
}

// Super Admin Login Handler
func superAdminLoginHandler(w http.ResponseWriter, r *http.Request) {
	var admin SuperAdmin
	if err := json.NewDecoder(r.Body).Decode(&admin); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if admin.Username != "admin" || admin.Password != "admin123" {
		respondWithError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Super Admin login successful"})
}

// Update Event Handler
func updateEventHandler(w http.ResponseWriter, r *http.Request) {
	var event Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(event); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := eventsCollection.UpdateOne(context.TODO(), bson.M{"id": event.ID}, bson.M{"$set": event})
	if err != nil {
		respondWithError(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Event updated successfully"})
}

// Update Booking Handler
func updateBookingHandler(w http.ResponseWriter, r *http.Request) {
	var booking Booking
	if err := json.NewDecoder(r.Body).Decode(&booking); err != nil {
		respondWithError(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := ValidateInput(booking); err != nil {
		respondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := bookingsCollection.UpdateOne(context.TODO(), bson.M{"room_id": booking.RoomID, "user_email": booking.UserEmail}, bson.M{"$set": booking})
	if err != nil {
		respondWithError(w, "Failed to update booking", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking updated successfully"})
}

// Delete User Handler
func deleteUserHandler(w http.ResponseWriter, r *http.Request) {
	email := mux.Vars(r)["email"]

	_, err := usersCollection.DeleteOne(context.TODO(), bson.M{"email": email})
	if err != nil {
		respondWithError(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

// Get All Users Handler
func getAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	cursor, err := usersCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		respondWithError(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var users []User
	if err = cursor.All(context.TODO(), &users); err != nil {
		respondWithError(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

// CORS middleware to enable CORS
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins (use specific domains in production)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Main function
func main() {
	rand.Seed(time.Now().UnixNano())
	validate = validator.New()
	connectMongoDB()
	defer client.Disconnect(context.TODO())

	r := mux.NewRouter()
	r.HandleFunc("/api/register", registerHandler).Methods("POST")
	r.HandleFunc("/api/login", loginHandler).Methods("POST")
	r.HandleFunc("/api/logout", logoutHandler).Methods("POST")
	r.HandleFunc("/api/events/register", registerEventHandler).Methods("POST")
	r.HandleFunc("/api/rooms/book", roomBookingHandler).Methods("POST")
	r.HandleFunc("/api/rooms/{id}", getRoomDetailsHandler).Methods("GET")
	r.HandleFunc("/api/users/{email}/bookings", getUserBookingsHandler).Methods("GET")
	r.HandleFunc("/api/users", getUsersHandler).Methods("GET")
	r.HandleFunc("/api/events/{id}/count", getEventUserCountHandler).Methods("GET")
	r.HandleFunc("/api/events/{id}/users", getEventUsersHandler).Methods("GET")
	r.HandleFunc("/api/events/complete", completeEventHandler).Methods("POST")
	r.HandleFunc("/api/events/verify", verifyEventHandler).Methods("POST")
	r.HandleFunc("/api/verify/otp", verifyOTP).Methods("POST")

	r.HandleFunc("/api/superadmin/login", superAdminLoginHandler).Methods("POST")
	r.HandleFunc("/api/events/update", updateEventHandler).Methods("PUT")
	r.HandleFunc("/api/bookings/update", updateBookingHandler).Methods("PUT")
	r.HandleFunc("/api/users/{email}", deleteUserHandler).Methods("DELETE")
	r.HandleFunc("/api/users", getAllUsersHandler).Methods("GET")

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

	// Wrap the router with CORS middleware
	http.Handle("/", enableCORS(r))

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
