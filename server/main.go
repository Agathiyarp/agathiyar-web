package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBConfig struct {
	URI      string
	Database string
	Timeout  time.Duration
}

func ConnectToMongoDB(cfg MongoDBConfig) (*mongo.Client, error) {
	// Set client options
	clientOptions := options.Client().ApplyURI(cfg.URI)

	// Create a new client and connect to the server
	ctx, cancel := context.WithTimeout(context.Background(), cfg.Timeout)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	fmt.Println("Connected to MongoDB!")
	return client, nil
}

var db *sql.DB

func init() {
	// MongoDB configuration
	cfg := MongoDBConfig{
		URI:      "mongodb://localhost:27017", // Replace with your MongoDB URI
		Database: "agathiyar",
		Timeout:  10 * time.Second,
	}

	// Connect to MongoDB
	client, err := ConnectToMongoDB(cfg)
	log.Println(client)
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}

	// Use the `client` to interact with the database...
	// e.g., client.Database(cfg.Database).Collection("mycollection")

	// Close the connection once you're done
	// defer func() {
	// 	if err := client.Disconnect(context.TODO()); err != nil {
	// 		log.Fatalf("Error disconnecting from MongoDB: %v", err)
	// 	}
	// 	fmt.Println("Disconnected from MongoDB.")
	// }()
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/register", RegisterHandler).Methods("POST")
	r.HandleFunc("/login", LoginHandler).Methods("POST")
	r.HandleFunc("/logout", LogoutHandler).Methods("POST")

	// Setup CORS options
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}), // Replace with your frontend URL
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(r)

	//http.ListenAndServe(":5000", corsHandler)
	log.Fatal(http.ListenAndServe(":8081", corsHandler))
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Register Success")
	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	/*
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", user.Username, hashedPassword)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	*/
	w.WriteHeader(http.StatusOK)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Login Success")
	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	/*
		var storedPassword string
		err = db.QueryRow("SELECT password FROM users WHERE username = ?", user.Username).Scan(&storedPassword)
		if err != nil || bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password)) != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}*/

	// Generate a session token here

	w.WriteHeader(http.StatusOK)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Invalidate the session token here
	log.Println("Logout Success")
	w.WriteHeader(http.StatusOK)
}
