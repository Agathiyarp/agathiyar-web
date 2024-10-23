package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var (
	client *mongo.Client
	store  = sessions.NewCookieStore([]byte("super-secret-key"))
)

type RegisterUser struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	PhoneNumber     string `json:"phoneNumber"`
	Country         string `json:"country"`
	Username        string `json:"username"`
	UserMemberID    string `json:"usermemberid"` //AGP202410000
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	UserType        string `json:"usertype"`
}

type LoginResponse struct {
	Name         string `json:"name"`
	Username     string `json:"username"`
	UserMemberID string `json:"usermemberid"`
	UserType     string `json:"usertype"`
}

type Response struct {
	Message string `json:"message"`
}

type AllUserResponse struct {
	Name        string `json:"name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`
	Country     string `json:"country"`
	Username    string `json:"username"`
}

type EventRegisterUser struct {
	EventName    string `json:"eventname"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	PhoneNumber  string `json:"phoneNumber"`
	Country      string `json:"country"`
	Username     string `json:"username"`
	Destination  string `json:"destination"`
	RoomType     string `json:"roomtype"`
	CheckIn      string `json:"checkin"`
	CheckOut     string `json:"checkout"`
	Amount       string `json:"amount"`
	MemberCount  string `json:"membercount"`
	NumberOfDays string `json:"numberofdays"`
}

type Room struct {
	ID       string `json:"id,omitempty" bson:"id,omitempty"`
	Type     string `json:"type,omitempty" bson:"type,omitempty"`
	IsBooked bool   `json:"isBooked" bson:"isBooked"`
	User     string `json:"user,omitempty" bson:"user,omitempty"`
}

var (
	currentID int
	mu        sync.Mutex
)

const maxRooms = 3 // Set maximum room count here
// Middleware to check if the user is authenticated
func isAuthenticated(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func validatePhoneNumber(phone string) bool {
	regex := `^\+?[1-9]\d{1,14}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(phone)
}

func connectMongo() {
	var err error
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017") // Change as needed
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		panic(err)
	}
	fmt.Println("mongoDB connected!!")
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		panic(err)
	}
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var registerUser RegisterUser
	err := json.NewDecoder(r.Body).Decode(&registerUser)
	registerUser.UserType = "donor"
	if err != nil || registerUser.Password == "" || registerUser.ConfirmPassword == "" ||
		!validatePhoneNumber(registerUser.PhoneNumber) {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if registerUser.Password != registerUser.ConfirmPassword {
		http.Error(w, "Passwords do not match", http.StatusBadRequest)
		return
	}

	// Generate a MemberID
	registerUser.UserMemberID = GenerateUserID()

	collection := client.Database("AgathiyarDB").Collection("Users")
	// Check if user already exists
	var existingUser RegisterUser
	// Define the query to find an existing user by either username or memberID
	filter := bson.M{
		"$or": []bson.M{
			{"username": existingUser.Username},
			{"usermemberid": existingUser.UserMemberID}, // Assuming you have MemberID in registerUser
		},
	}
	// Attempt to find an existing user
	err = collection.FindOne(context.TODO(), filter).Decode(&existingUser)

	if err == nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	hashedPassword, err := hashPassword(registerUser.Password)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	registerUser.Password = hashedPassword

	hashedPasswordconfirm, err := hashPassword(registerUser.ConfirmPassword)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	registerUser.ConfirmPassword = hashedPasswordconfirm

	_, err = collection.InsertOne(context.TODO(), registerUser)
	if err != nil {
		http.Error(w, "Could not register user", http.StatusInternalServerError)
		return
	}

	response := Response{Message: "User registered successfully"}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var registerUser RegisterUser
	fmt.Println("loginHandler: start")

	// Decode the incoming JSON request
	err := json.NewDecoder(r.Body).Decode(&registerUser)
	if err != nil {
		log.Printf("loginHandler: Invalid input: %v", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	collection := client.Database("AgathiyarDB").Collection("Users")

	// Check if the user exists in the database by username or memberID
	var existingUser RegisterUser
	filter := bson.M{
		"$or": []bson.M{
			{"username": registerUser.Username},
			{"usermemberid": registerUser.Username},
		},
	}

	err = collection.FindOne(context.TODO(), filter).Decode(&existingUser)
	if err == mongo.ErrNoDocuments {
		log.Printf("loginHandler: User not found: %s or memberID: %s", registerUser.Username, registerUser.UserMemberID)
		http.Error(w, "Invalid username, memberID, or password", http.StatusUnauthorized)
		return
	} else if err != nil {
		log.Printf("loginHandler: Error finding user: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Check if the provided password matches the stored password
	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(registerUser.Password)); err != nil {
		log.Printf("loginHandler: Invalid password for user: %s", registerUser.Username)
		http.Error(w, "Invalid username, memberID, or password", http.StatusUnauthorized)
		return
	}

	// Create a session for the user
	session, err := store.Get(r, "session")
	if err != nil {
		log.Printf("loginHandler: Error getting session: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	session.Values["authenticated"] = true
	session.Values["username"] = registerUser.Username
	session.Values["usermemberid"] = registerUser.UserMemberID
	session.Values["usertype"] = registerUser.UserType

	if err := session.Save(r, w); err != nil {
		log.Printf("loginHandler: Error saving session: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Send a successful response with username and memberID
	response := LoginResponse{
		Username:     existingUser.Username,
		UserMemberID: existingUser.UserMemberID,
		UserType:     existingUser.UserType,
	}
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("loginHandler: Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	fmt.Println("login successful for user:", registerUser.Username)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	session.Values["authenticated"] = false
	session.Values["username"] = ""
	session.Values["usermemberid"] = ""
	session.Save(r, w)

	response := Response{Message: "Logout successful"}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Example protected route
func protectedHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	email := session.Values["email"]
	response := Response{Message: "Welcome " + email.(string)}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetAllUsersHandler retrieves all users from the database
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	collection := client.Database("AgathiyarDB").Collection("Users")
	fmt.Println("GetAllUsersHandler: Starting")

	// Ping the database to confirm connection
	if err := client.Ping(context.TODO(), nil); err != nil {
		log.Printf("GetAllUsersHandler: Database ping failed: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Find all users
	cursor, err := collection.Find(context.TODO(), bson.D{{}})
	if err != nil {
		log.Printf("GetAllUsersHandler: Error finding users: %v", err)
		http.Error(w, "Error retrieving users from database", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO()) // Ensure cursor is closed
	fmt.Println("GetAllUsersHandler: Query executed")

	var allUsers []AllUserResponse
	for cursor.Next(context.TODO()) {
		var responseuser RegisterUser
		if err := cursor.Decode(&responseuser); err != nil {
			log.Printf("GetAllUsersHandler: Error decoding user: %v", err)
			http.Error(w, "Error decoding user data", http.StatusInternalServerError)
			return
		}
		allUsers = append(allUsers, AllUserResponse{
			Name:        responseuser.Name,
			Email:       responseuser.Email,
			PhoneNumber: responseuser.PhoneNumber,
			Country:     responseuser.Country,
			Username:    responseuser.Username,
		})
	}

	// Check for cursor errors
	if err := cursor.Err(); err != nil {
		log.Printf("GetAllUsersHandler: Cursor error: %v", err)
		http.Error(w, "Error reading user data", http.StatusInternalServerError)
		return
	}

	fmt.Println("GetAllUsersHandler: Users processed, preparing response")

	// Set response header and encode response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(allUsers); err != nil {
		log.Printf("GetAllUsersHandler: Error encoding response: %v", err)
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}

	fmt.Println("GetAllUsersHandler: Response sent successfully")
}

// userByIDHandler retrieves a single user from the database based on user ID
func userByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Get the user ID from the URL parameters
	vars := mux.Vars(r)
	userID := vars["id"]

	collection := client.Database("AgathiyarDB").Collection("Users")
	fmt.Println("userByIDHandler: Starting")

	// Ping the database to confirm connection
	if err := client.Ping(context.TODO(), nil); err != nil {
		log.Printf("userByIDHandler: Database ping failed: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}

	// Convert userID to ObjectID (if using ObjectIDs)
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("userByIDHandler: Invalid user ID format: %v", err)
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	// Find the user by ID
	var responseUser RegisterUser
	err = collection.FindOne(context.TODO(), bson.M{"_id": objectID}).Decode(&responseUser)
	if err == mongo.ErrNoDocuments {
		log.Printf("userByIDHandler: User not found for ID: %s", userID)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	} else if err != nil {
		log.Printf("userByIDHandler: Error finding user: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Prepare the response
	response := AllUserResponse{
		Name:        responseUser.Name,
		Email:       responseUser.Email,
		PhoneNumber: responseUser.PhoneNumber,
		Country:     responseUser.Country,
		Username:    responseUser.Username,
	}

	fmt.Println("userByIDHandler: User found, preparing response")

	// Set response header and encode response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("userByIDHandler: Error encoding response: %v", err)
		http.Error(w, "Error generating response", http.StatusInternalServerError)
		return
	}

	fmt.Println("userByIDHandler: Response sent successfully")
}

// GenerateUserID generates a new member ID in the format AGPYYYY000001
func GenerateUserID() string {
	mu.Lock()
	defer mu.Unlock()

	currentID++
	year := time.Now().Year()
	userID := fmt.Sprintf("AGP%d%06d", year, currentID)
	return userID
}

// EventRegistrationHandler handles the event registration requests
func EventRegistrationHandler(w http.ResponseWriter, r *http.Request) {
	var registration EventRegisterUser

	// Decode the JSON request
	err := json.NewDecoder(r.Body).Decode(&registration)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Generate a MemberID
	//registration.MemberID = GenerateUserID()

	// Insert registration into the new collection
	collection := client.Database("AgathiyarDB").Collection("Events")
	_, err = collection.InsertOne(context.TODO(), registration)
	if err != nil {
		http.Error(w, "Error saving registration", http.StatusInternalServerError)
		return
	}

	// Respond back with the registration details
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(registration)
}

// GetAllEventRegistrations retrieves all event registrations from the database
func GetAllEventRegistrations(w http.ResponseWriter, r *http.Request) {
	collection := client.Database("AgathiyarDB").Collection("Events")

	// Find all event registrations
	cursor, err := collection.Find(context.TODO(), bson.D{{}})
	if err != nil {
		http.Error(w, "Error retrieving event registrations", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var allRegistrations []EventRegisterUser
	for cursor.Next(context.TODO()) {
		var registration EventRegisterUser
		if err := cursor.Decode(&registration); err != nil {
			http.Error(w, "Error decoding event registration", http.StatusInternalServerError)
			return
		}
		allRegistrations = append(allRegistrations, registration)
	}

	// Check for cursor errors
	if err := cursor.Err(); err != nil {
		http.Error(w, "Error reading event registrations", http.StatusInternalServerError)
		return
	}

	// Respond with the list of all registrations
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(allRegistrations)
}

func validateRoomType(roomType string) bool {
	validRoomTypes := map[string]bool{
		"TypeA": true,
		"TypeB": true,
		"TypeC": true,
		"TypeD": true,
	}
	return validRoomTypes[roomType]
}

// Check how many rooms a user has booked
func countBookedRooms(user string) (int, error) {
	collection := client.Database("AgathiyarDB").Collection("Rooms")
	count, err := collection.CountDocuments(context.TODO(), bson.M{"user": user, "isBooked": true})
	return int(count), err
}

// API to book a room
func bookRoom(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var room Room
	_ = json.NewDecoder(r.Body).Decode(&room)

	// Validate room type
	if !validateRoomType(room.Type) {
		http.Error(w, "Invalid room type", http.StatusBadRequest)
		return
	}

	// Check how many rooms the user has already booked
	roomsBooked, err := countBookedRooms(room.User)
	if err != nil {
		http.Error(w, "Error checking booked rooms", http.StatusInternalServerError)
		return
	}

	// Check if the room is already booked by the user
	existingRoom := Room{}
	err = client.Database("hotel").Collection("rooms").FindOne(context.TODO(), bson.M{"user": room.User, "id": room.ID}).Decode(&existingRoom)
	if err == nil && existingRoom.IsBooked {
		http.Error(w, "Room already booked by this user", http.StatusConflict)
		return
	}

	// Limit: max rooms per user
	if roomsBooked+1 > maxRooms { // +1 for the current booking
		http.Error(w, fmt.Sprintf("User can only book a maximum of %d rooms", maxRooms), http.StatusForbidden)
		return
	}

	// Check for available rooms of the requested type
	filter := bson.M{"type": room.Type, "isBooked": false}
	update := bson.M{"$set": bson.M{"isBooked": true, "user": room.User}}
	err = client.Database("hotel").Collection("rooms").FindOneAndUpdate(context.TODO(), filter, update).Decode(&room)

	// If no available room is found, return an error
	if err != nil {
		http.Error(w, "No rooms available for this type", http.StatusNotFound)
		return
	}

	// Return the booked room information
	json.NewEncoder(w).Encode(room)
}

// API to initialize rooms
func initRooms(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rooms := []Room{}
	roomTypes := []string{"TypeA", "TypeB", "TypeC", "TypeD"}

	for _, roomType := range roomTypes {
		for i := 1; i <= 30; i++ {
			rooms = append(rooms, Room{ID: fmt.Sprintf("%s-%d", roomType, i), Type: roomType, IsBooked: false})
		}
	}

	collection := client.Database("hotel").Collection("rooms")
	collection.DeleteMany(context.TODO(), bson.M{}) // Clear previous data
	_, err := collection.InsertMany(context.TODO(), toBSON(rooms))
	if err != nil {
		http.Error(w, "Failed to initialize rooms", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode("Rooms initialized")
}

// API to check available rooms by type
func availableRooms(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	roomType := r.URL.Query().Get("type")

	if !validateRoomType(roomType) {
		http.Error(w, "Invalid room type", http.StatusBadRequest)
		return
	}

	collection := client.Database("hotel").Collection("rooms")
	availableRooms, err := collection.CountDocuments(context.TODO(), bson.M{"type": roomType, "isBooked": false})

	if err != nil {
		http.Error(w, "Error fetching available rooms", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]int{"availableRooms": int(availableRooms)})
}

func toBSON(rooms []Room) []interface{} {
	interfaces := make([]interface{}, len(rooms))
	for i, room := range rooms {
		interfaces[i] = room
	}
	return interfaces
}

// Main function start
func main() {
	connectMongo()
	defer client.Disconnect(context.TODO())

	router := mux.NewRouter()
	router.HandleFunc("/api/register", registerHandler).Methods("POST")
	router.HandleFunc("/api/login", loginHandler).Methods("POST")
	router.HandleFunc("/api/logout", logoutHandler).Methods("POST")
	router.Handle("/api/protected", isAuthenticated(http.HandlerFunc(protectedHandler))).Methods("GET")
	router.HandleFunc("/api/users", GetAllUsersHandler)
	router.HandleFunc("api/users/{id:[0-9]+}", userByIDHandler) // Only matches numeric user IDs
	router.HandleFunc("/api/event/register", EventRegistrationHandler).Methods("POST")
	router.HandleFunc("/api/allevents", GetAllEventRegistrations).Methods("GET")

	//Room
	// Routes
	router.HandleFunc("/api/book", bookRoom).Methods("POST")
	router.HandleFunc("/api/init", initRooms).Methods("POST")
	router.HandleFunc("/api/available", availableRooms).Methods("GET")

	// allowedOrigins := handlers.AllowedOrigins([]string{"https://213.210.37.35:3000", "https://213.210.37.35:8080", "https://www.agathiyarpyramid.org", "http://www.agathiyarpyramid.org", "http://localhost:3000", "http://localhost:8080"})
	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router)); err != nil {
		log.Fatalf("could not start server: %s", err)
	}
}
