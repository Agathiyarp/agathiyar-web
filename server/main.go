package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("mysql", "user:password@tcp(localhost:3306)/dbname")
	if err != nil {
		log.Fatal(err)
	}
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
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
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
