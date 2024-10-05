package main

import (
	"context"
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var (
	client *mongo.Client
	store  = sessions.NewCookieStore([]byte("super-secret-key"))
)

type User struct {
	FullName        string `json:"fullName"`
	Email           string `json:"email"`
	PhoneNumber     string `json:"phoneNumber"`
	BirthDate       string `json:"birthDate"`
	Gender          string `json:"gender"`
	Address         string `json:"address"`
	AddressLine2    string `json:"addressLine2"`
	Country         string `json:"country"`
	City            string `json:"city"`
	PostalCode      string `json:"postalCode"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type LoginResponse struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
}

type Response struct {
	Message string `json:"message"`
}

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

// CORS Middleware
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Cookie")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func validateEmail(email string) bool {
	regex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(email)
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
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || user.Password == "" || user.ConfirmPassword == "" ||
		!validateEmail(user.Email) || !validatePhoneNumber(user.PhoneNumber) {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if user.Password != user.ConfirmPassword {
		http.Error(w, "Passwords do not match", http.StatusBadRequest)
		return
	}

	collection := client.Database("userdb").Collection("users")

	// Check if user already exists
	var existingUser User
	err = collection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	hashedPasswordconfirm, err := hashPassword(user.ConfirmPassword)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	user.ConfirmPassword = hashedPasswordconfirm

	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		http.Error(w, "Could not register user", http.StatusInternalServerError)
		return
	}

	response := Response{Message: "User registered successfully"}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || !validateEmail(user.Email) {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	collection := client.Database("userdb").Collection("users")
	var existingUser User
	err = collection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(user.Password)) != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	session, _ := store.Get(r, "session")
	session.Values["authenticated"] = true
	session.Values["email"] = user.Email
	session.Save(r, w)
	response := LoginResponse{Email: user.Email}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	session.Values["authenticated"] = false
	session.Values["email"] = ""
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

func main() {
	connectMongo()
	defer client.Disconnect(context.TODO())

	router := mux.NewRouter()
	router.HandleFunc("/api/register", registerHandler).Methods("POST")
	router.HandleFunc("/api/login", loginHandler).Methods("POST")
	router.HandleFunc("/api/logout", logoutHandler).Methods("POST")
	router.Handle("/api/protected", isAuthenticated(http.HandlerFunc(protectedHandler))).Methods("GET")

	handler := cors(router)

	http.ListenAndServe(":8080", handler)
}
