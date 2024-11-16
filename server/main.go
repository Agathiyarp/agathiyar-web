package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/jung-kurt/gofpdf"
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

// Data structure to match your JSON input
type EventRegistration struct {
	Comments string `json:"comments"`
	MemberId string `json:"memberId"`
	Data     []struct {
		Name   string `json:"name"`
		Phone  string `json:"phone"`
		Email  string `json:"email"`
		Age    int    `json:"age"`
		Gender string `json:"gender"`
	} `json:"data"`
	EventID string `json: "eventId"`
}

type RegisterUser struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	PhoneNumber     string `json:"phoneNumber"`
	Country         string `json:"country"`
	Username        string `json:"username"`
	UserMemberID    string `json:"usermemberid"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	UserType        string `json:"usertype"`
	ProfileImage    string `json:"profileImage"`
	Address         string `json:"address"`
	DateOfBirth     string `json:"dateofbirth"`
	Gender          string `json:"gender"`
}

type LoginResponse struct {
	Name         string `json:"name"`
	Username     string `json:"username"`
	UserMemberID string `json:"usermemberid"`
	UserType     string `json:"usertype"`
	UserImage    string `json:"profileImage"`
	UserPhone    string `json:"phoneNumber"`
	UserEmail    string `json:"email"`
	Gender       string `json:"gender"`
}

type Response struct {
	Message string `json:"message"`
}

type AllUserResponse struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	PhoneNumber  string `json:"phoneNumber"`
	Country      string `json:"country"`
	Username     string `json:"username"`
	UserMemberID string `json:"usermemberid"`
	UserType     string `json:"usertype"`
	Address      string `json:"address"`
	DateOfBirth  string `json:"dateofbirth"`
	Gender       string `json:"gender"`
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

type RoomType struct {
	Name        string `json:"name"`
	Capacity    int    `json:"capacity"`
	ACAvailable bool   `json:"ac_available"`
	Description string `json:"description"`
	Count       int    `json:"count"` // Available rooms count
}

type Destination struct {
	Name      string     `json:"name"`
	RoomTypes []RoomType `json:"room_types"`
}

var (
	destinations = map[string]Destination{
		"Agathiyar Bhavan": {
			Name: "Agathiyar Bhavan",
			RoomTypes: []RoomType{
				{"Single Room (Max 1 person)", 1, true, "A cozy single room perfect for one.", 10},
				{"Single Room (Non A/C)", 1, false, "A comfortable non-AC single room for one.", 5},
			},
		},
		"Patriji Bavan": {
			Name: "Patriji Bavan",
			RoomTypes: []RoomType{
				{"Double Room (Max 2-4 people)", 4, true, "A spacious room suitable for up to four.", 8},
				{"Double Room (Non A/C)", 4, false, "A well-furnished non-AC room for up to four.", 3},
			},
		},
		"Dormitory": {
			Name: "Dormitory",
			RoomTypes: []RoomType{
				{"Resting Area (Max 20 people)", 20, true, "A large dormitory accommodating up to 20 people.", 2},
			},
		},
	}

	muxBooking sync.Mutex
)

type BookingRequest struct {
	Destination  string `json:"destination"`
	RoomType     string `json:"room_type"`
	CheckInDate  string `json:"checkindate"`
	CheckOutDate string `json:"checkoutdate"`
	PeopleCount  int    `json:"people_count"`
	ACRequired   bool   `json:"ac_required"`
}

type AvailabilityResponse struct {
	Destination string     `json:"destination"`
	Rooms       []RoomType `json:"rooms"`
}

type EventAdd struct {
	EventID              primitive.ObjectID `json:"eventid,omitempty" bson:"_id,omitempty"`
	EventName            string             `json:"eventname" bson:"eventname"`
	MasterName           string             `json:"mastername" bson:"mastername"`
	StartDate            string             `json:"startdate" bson:"startdate"`
	EndDate              string             `json:"enddate" bson:"enddate"`
	NumberOfDays         string             `json:"numberofdays" bson:"numberofdays"`
	EventDescription     string             `json:"eventdescription" bson:"eventdescription"`
	Destination          string             `json:"destination" bson:"destination"`
	RoomType             string             `json:"roomtype" bson:"roomtype"`
	NumberOfParticipants string             `json:"numberofparticipants" bson:"numberofparticipants"`
	RetreatCost          string             `json:"retreatcost" bson:"retreatcost"`
	ReserveDeposit       string             `json:"reservedeposit" bson:"reservedeposit"`
	ContactDetails       string             `json:"contactdetails" bson:"contactdetails"`
	Image                string             `json:"imageurl" bson:"imageurl"`
	Language             string             `json:"language" bson:"language"`
}

type BookingAdd struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Destination     string             `json:"destination"`
	StartDate       time.Time          `json:"startdate" bson:"startdate"`
	EndDate         time.Time          `json:"enddate" bson:"enddate"`
	SingleOccupy    string             `json:"singleoccupy"`
	RoomDescription string             `json:"roomdescription" bson:"roomdescription"`
	RoomType        string             `json:"roomtype"`
	TotalRooms      string             `json:"totalrooms"`
	RoomVariation   string             `json:"roomvariation"`
	RoomCost        string             `json:"roomcost"`
	MaintenanceCost string             `json:"maintanancecost"`
	SingleImage     string             `json:"image" bson:"image"`
	MultipleImage   []string           `json:"multipleimage" bson:"multipleimage"` // Slice for multiple images
}

type BookingSummary struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	MemberId        string             `json:"memberid"`
	Email           string             `json:"email"`
	UserName        string             `json:"username"`
	RoomId          int                `json:"roomid"`
	Destination     string             `json:"destination"`
	StartDate       string             `json:"startdate"`
	EndDate         string             `json:"enddate"`
	SingleOccupy    string             `json:"singleoccupy"`
	RoomDescription string             `json:"roomdescription" bson:"roomdescription"`
	RoomType        string             `json:"roomtype"`
	TotalRooms      int                `json:"totalrooms"`
	RoomVariation   string             `json:"roomvariation"`
	RoomCost        int                `json:"roomcost"`
	MaintenanceCost int                `json:"maintanancecost"`
	TotalAmount     int                `json:"totalamount"`
	BookingStatus   string             `json:"bookingstatus"`
}

var (
	currentID int = 100000
	mu        sync.Mutex
)

func validatePhoneNumber(phone string) bool {
	regex := `^\+?[1-9]\d{1,14}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(phone)
}

func connectMongo() {
	var err error
	//clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	clientOptions := options.Client().ApplyURI("mongodb://root:Test12345678@localhost:27017")
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

func validateProfileImage(image string) bool {
	// Define a regular expression to match the data URI pattern
	dataURIPattern := `^data:image/(jpeg|jpg|png|gif);base64,`

	// Check if the image matches the data URI pattern
	matched, _ := regexp.MatchString(dataURIPattern, image)
	if !matched {
		return false
	}

	// Separate the base64 portion from the data URI
	base64Data := strings.Split(image, ",")[1]

	// Validate the base64 data
	return isBase64(base64Data)
}

func isBase64(s string) bool {
	_, err := base64.StdEncoding.DecodeString(s)
	return err == nil
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var registerUser RegisterUser
	err := json.NewDecoder(r.Body).Decode(&registerUser)
	registerUser.UserType = ""
	registerUser.DateOfBirth = ""
	registerUser.Gender = ""
	registerUser.Address = ""

	if err != nil {
		log.Printf("Error decoding JSON: %v", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if registerUser.Password == "" || registerUser.ConfirmPassword == "" {
		log.Println("Error: Password or ConfirmPassword is empty")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if !validatePhoneNumber(registerUser.PhoneNumber) {
		log.Println("Error: Invalid phone number")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if !validateProfileImage(registerUser.ProfileImage) {
		log.Println("Error: Invalid profile image")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if registerUser.Password != registerUser.ConfirmPassword {
		log.Println("Error: Passwords do not match")
		http.Error(w, "Passwords do not match", http.StatusBadRequest)
		return
	}

	registerUser.UserMemberID = GenerateUserID()
	collection := client.Database("AgathiyarDB").Collection("Users")

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
	registerUser.ConfirmPassword = hashedPassword

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
	session.Values["image"] = registerUser.ProfileImage
	session.Values["email"] = registerUser.Email
	session.Values["phone"] = registerUser.PhoneNumber
	session.Values["gender"] = registerUser.Gender

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
		UserImage:    existingUser.ProfileImage,
		UserPhone:    existingUser.PhoneNumber,
		UserEmail:    existingUser.Email,
		Gender:       existingUser.Gender,
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
			Name:         responseuser.Name,
			Email:        responseuser.Email,
			PhoneNumber:  responseuser.PhoneNumber,
			Country:      responseuser.Country,
			Username:     responseuser.Username,
			UserMemberID: responseuser.UserMemberID,
			UserType:     responseuser.UserType,
			Gender:       responseuser.Gender,
			DateOfBirth:  responseuser.DateOfBirth,
			Address:      responseuser.Address,
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

	currentID++ // Increment currentID
	year := time.Now().Year()
	userID := fmt.Sprintf("AGP%d%06d", year, currentID) // Format the user ID
	return userID
}

func getAvailability(w http.ResponseWriter, r *http.Request) {
	destination := r.URL.Query().Get("destination")

	dest, ok := destinations[destination]
	if !ok {
		http.Error(w, "Invalid destination", http.StatusBadRequest)
		return
	}

	response := AvailabilityResponse{
		Destination: dest.Name,
		Rooms:       dest.RoomTypes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func bookRoom(w http.ResponseWriter, r *http.Request) {
	var bookingRequest BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&bookingRequest); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate booking request
	muxBooking.Lock() // Lock for concurrent access
	defer muxBooking.Unlock()

	dest, ok := destinations[bookingRequest.Destination]
	if !ok {
		http.Error(w, "Invalid destination", http.StatusBadRequest)
		return
	}

	// Validate dates
	checkIn, err := time.Parse("02/01/2006", bookingRequest.CheckInDate)
	if err != nil {
		http.Error(w, "Invalid check-in date format", http.StatusBadRequest)
		return
	}
	checkOut, err := time.Parse("02/01/2006", bookingRequest.CheckOutDate)
	if err != nil {
		http.Error(w, "Invalid check-out date format", http.StatusBadRequest)
		return
	}
	if checkOut.Before(checkIn) {
		http.Error(w, "Check-out date must be after check-in date", http.StatusBadRequest)
		return
	}

	var roomFound bool
	for i, room := range dest.RoomTypes {
		if room.Name == bookingRequest.RoomType {
			if bookingRequest.PeopleCount > room.Capacity {
				http.Error(w, "People count exceeds room capacity", http.StatusBadRequest)
				return
			}
			if bookingRequest.ACRequired && !room.ACAvailable {
				http.Error(w, "AC not available for the selected room type", http.StatusBadRequest)
				return
			}
			if room.Count <= 0 {
				http.Error(w, "No rooms available", http.StatusBadRequest)
				return
			}

			// Decrease the available room count
			destinations[bookingRequest.Destination].RoomTypes[i].Count--
			roomFound = true
			break
		}
	}

	if !roomFound {
		http.Error(w, "Room type not found", http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":       "Room booked successfully",
		"destination":   bookingRequest.Destination,
		"room_type":     bookingRequest.RoomType,
		"checkin_date":  bookingRequest.CheckInDate,
		"checkout_date": bookingRequest.CheckOutDate,
		"people_count":  bookingRequest.PeopleCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func addEventHandler(w http.ResponseWriter, r *http.Request) {
	var event EventAdd
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	collection := client.Database("AgathiyarDB").Collection("eventdetails")

	result, err := collection.InsertOne(context.TODO(), event)
	if err != nil {
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"status":  "success",
		"message": "Event added successfully",
		"eventId": result.InsertedID,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Handler to get an event by ID
func getEventHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	eventID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	collection := client.Database("AgathiyarDB").Collection("eventdetails")
	var event EventAdd

	filter := bson.M{"_id": eventID}
	err = collection.FindOne(context.TODO(), filter).Decode(&event)
	if err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

func getAllEventsHandler(w http.ResponseWriter, r *http.Request) {

	collection := client.Database("AgathiyarDB").Collection("eventdetails")
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var events []EventAdd
	for cursor.Next(context.TODO()) {
		var event EventAdd
		if err := cursor.Decode(&event); err != nil {
			http.Error(w, "Error decoding event", http.StatusInternalServerError)
			return
		}
		events = append(events, event)
	}

	if err := cursor.Err(); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// Adds a new booking
func addBooking(w http.ResponseWriter, r *http.Request) {
	var booking BookingAdd
	err := json.NewDecoder(r.Body).Decode(&booking)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Define the subcollection based on the destination name
	collection := client.Database("AgathiyarDB").
		Collection("BookingDetails" + booking.Destination + booking.RoomType)

	// Check for existing booking in the specified date range
	filter := bson.M{
		"startdate": bson.M{"$lte": booking.EndDate},
		"enddate":   bson.M{"$gte": booking.StartDate},
	}

	var existingBooking BookingAdd
	err = collection.FindOne(context.TODO(), filter).Decode(&existingBooking)
	if err == nil {
		http.Error(w, "Booking already exists for the specified date range", http.StatusConflict)
		return
	}

	// Insert the new booking
	booking.ID = primitive.NewObjectID()
	_, err = collection.InsertOne(context.TODO(), booking)
	if err != nil {
		http.Error(w, "Failed to add booking", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking added successfully"})
}

func bookingSummary(w http.ResponseWriter, r *http.Request) {
	var bookingSummary BookingSummary
	err := json.NewDecoder(r.Body).Decode(&bookingSummary)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Define the subcollection based on the destination name
	collection := client.Database("AgathiyarDB").
		Collection("RoomBooking" + bookingSummary.Destination + bookingSummary.RoomType)

	// Insert the new booking
	bookingSummary.ID = primitive.NewObjectID()
	_, err = collection.InsertOne(context.TODO(), bookingSummary)
	if err != nil {
		http.Error(w, "Failed to add booking", http.StatusInternalServerError)
		bookingSummary.BookingStatus = "failure"
		return
	} else {
		bookingSummary.BookingStatus = "success"
	}

	// Generate PDF
	pdfFileName, err := generateBookingPDF(bookingSummary)
	if err != nil {
		http.Error(w, "Failed to generate PDF", http.StatusInternalServerError)
		return
	}

	// Send Email
	err = sendBookingEmail(bookingSummary, pdfFileName)
	if err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Room booked successfully"})
}

// generateBookingPDF creates a PDF with booking details
func generateBookingPDF(booking BookingSummary) (string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Booking Confirmation")

	// Add booking details
	pdf.SetFont("Arial", "", 12)
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Booking ID: %s", booking.ID.Hex()))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Member ID: %s", booking.MemberId))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("User Name: %s", booking.UserName))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Room ID: %d", booking.RoomId))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Destination: %s", booking.Destination))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Room Type: %s", booking.RoomType))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Start Date: %s", booking.StartDate))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("End Date: %s", booking.EndDate))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Single Occupancy: %s", booking.SingleOccupy))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Room Description: %s", booking.RoomDescription))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Total Rooms: %d", booking.TotalRooms))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Room Variation: %s", booking.RoomVariation))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Room Cost: %d", booking.RoomCost))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Maintenance Cost: %d", booking.MaintenanceCost))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Total Amount: %d", booking.TotalAmount))
	pdf.Ln(10)
	pdf.Cell(40, 10, fmt.Sprintf("Booking Status: %s", booking.BookingStatus))

	// Define file path and save PDF
	pdfFilePath := filepath.Join("pdf/file", fmt.Sprintf("%s.pdf", booking.MemberId))
	err := pdf.OutputFileAndClose(pdfFilePath)
	if err != nil {
		return "", err
	}
	return pdfFilePath, nil
}

// sendBookingEmail sends an email with the booking confirmation PDF attached

func sendBookingEmail(booking BookingSummary, pdfFilePath string) error {
	// Sender's email and credentials
	sender := "agathiyarashram1@gmail.com"
	password := "Test@1234" // Replace with your Gmail password

	// Receiver's email
	receiver := booking.Email

	// Email subject and body
	subject := "Booking Confirmation"
	body := "Your booking has been confirmed. Please find the attached PDF for details."

	// Set up the SMTP server address and port
	smtpServer := "smtp.hostinger.com"
	port := "587"

	// Set up authentication
	auth := smtp.PlainAuth("", sender, password, smtpServer)

	fmt.Println(receiver)

	// Create the email message
	message := []byte("Subject: " + subject + "\r\n" + "To: " + receiver + "\r\n" + "From: " + sender + "\r\n\r\n" + body)

	// Send the email
	err := smtp.SendMail(smtpServer+":"+port, auth, sender, []string{receiver}, message)
	if err != nil {
		log.Println("Failed to send email:", err)
		return err
	}

	log.Println("Booking email sent successfully!")
	return nil
}

// Filters bookings by destination and date range
func filterBookings(w http.ResponseWriter, r *http.Request) {
	destination := r.URL.Query().Get("destination")
	startDateStr := r.URL.Query().Get("startdate")
	endDateStr := r.URL.Query().Get("enddate")
	var RoomType string = ""

	// Parse start and end dates
	startDate, err := time.Parse(time.RFC3339, startDateStr)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid start date format: %s", startDateStr), http.StatusBadRequest)
		return
	}
	endDate, err := time.Parse(time.RFC3339, endDateStr)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid end date format: %s", endDateStr), http.StatusBadRequest)
		return
	}

	// Define filter for MongoDB query
	filter := bson.M{
		"destination": destination,
		"startdate":   bson.M{"$gte": startDate},
		"enddate":     bson.M{"$lte": endDate},
	}

	// Find matching bookings
	if destination == "Agathiyar Bhavan" {
		RoomType = "single"
	} else if destination == "Pathriji Bhavan" {
		RoomType = "double"
	} else {
		RoomType = "common"
	}
	collection := client.Database("AgathiyarDB").
		Collection("BookingDetails" + destination + RoomType)
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		http.Error(w, "Failed to retrieve bookings", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var bookings []BookingAdd
	if err = cursor.All(context.TODO(), &bookings); err != nil {
		http.Error(w, "Failed to decode bookings", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(bookings)
}

func registerEvent(w http.ResponseWriter, r *http.Request) {
	var memberData EventRegistration

	// Decode the JSON body
	err := json.NewDecoder(r.Body).Decode(&memberData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	subCollection := memberData.EventID

	// Define the subcollection
	subCollectionRef := client.Database("AgathiyarDB").Collection("eventregister" + subCollection)

	// Insert the data into MongoDB
	_, err = subCollectionRef.InsertOne(context.TODO(), memberData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data inserted successfully!"})
}

func eventUpdateHandler(w http.ResponseWriter, r *http.Request) {
	eventIDParam := mux.Vars(r)["id"]
	eventID, err := primitive.ObjectIDFromHex(eventIDParam)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	var updateData EventAdd
	err = json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	collection := client.Database("AgathiyarDB").Collection("eventdetails")

	// Build the update document
	update := bson.M{}
	if updateData.EventName != "" {
		update["eventname"] = updateData.EventName
	}
	if updateData.MasterName != "" {
		update["mastername"] = updateData.MasterName
	}
	if updateData.StartDate != "" {
		update["startdate"] = updateData.StartDate
	}
	if updateData.EndDate != "" {
		update["enddate"] = updateData.EndDate
	}
	if updateData.NumberOfDays != "" {
		update["numberofdays"] = updateData.NumberOfDays
	}
	if updateData.EventDescription != "" {
		update["eventdescription"] = updateData.EventDescription
	}
	if updateData.Destination != "" {
		update["destination"] = updateData.Destination
	}
	if updateData.RoomType != "" {
		update["roomtype"] = updateData.RoomType
	}
	if updateData.NumberOfParticipants != "" {
		update["numberofparticipants"] = updateData.NumberOfParticipants
	}
	if updateData.RetreatCost != "" {
		update["retreatcost"] = updateData.RetreatCost
	}
	if updateData.ReserveDeposit != "" {
		update["reservedeposit"] = updateData.ReserveDeposit
	}
	if updateData.ContactDetails != "" {
		update["contactdetails"] = updateData.ContactDetails
	}
	if updateData.Image != "" {
		update["imageurl"] = updateData.Image
	}
	if updateData.Language != "" {
		update["language"] = updateData.Language
	}

	// Perform the update
	if len(update) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	result, err := collection.UpdateOne(context.TODO(), bson.M{"_id": eventID}, bson.M{"$set": update})
	if err != nil {
		http.Error(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "No event found with the given ID", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"status":  "success",
		"message": "Event updated successfully",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Main function start
func main() {
	connectMongo()
	defer client.Disconnect(context.TODO())

	router := mux.NewRouter()
	router.HandleFunc("/api/register", registerHandler).Methods("POST")
	router.HandleFunc("/api/login", loginHandler).Methods("POST")
	router.HandleFunc("/api/logout", logoutHandler).Methods("POST")
	router.HandleFunc("/api/users", GetAllUsersHandler)
	router.HandleFunc("api/users/{id:[0-9]+}", userByIDHandler) // Only matches numeric user IDs

	//adding new events and get event based on id
	router.HandleFunc("/api/add-event", addEventHandler).Methods("POST")
	router.HandleFunc("/api/get-event/{id}", getEventHandler).Methods("GET")
	router.HandleFunc("/api/get-events", getAllEventsHandler).Methods("GET")
	router.HandleFunc("/api/event/user/register", registerEvent).Methods("POST")
	router.HandleFunc("/api/event/update/{id}", eventUpdateHandler).Methods("PUT")

	// Route for adding bookings
	router.HandleFunc("/api/addbooking", addBooking).Methods("POST")
	router.HandleFunc("/api/roombooking", bookingSummary).Methods("POST")

	// Route for filtering bookings
	// router.HandleFunc("/api/filterbookings", filterBookings).Methods("GET")
	router.HandleFunc("/api/bookings/filter", filterBookings).Methods("GET")

	router.HandleFunc("/api/book", bookRoom).Methods("POST")
	router.HandleFunc("/availability", getAvailability).Methods("GET")

	// allowedOrigins := handlers.AllowedOrigins([]string{"https://213.210.37.35:3000", "https://213.210.37.35:8080", "https://www.agathiyarpyramid.org", "http://www.agathiyarpyramid.org", "http://localhost:3000", "http://localhost:8080"})
	allowedOrigins := handlers.AllowedOrigins([]string{"*"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	log.Println("Server starting on port 8080")
	if err := http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(router)); err != nil {
		log.Fatalf("could not start server: %s", err)
	}
}
