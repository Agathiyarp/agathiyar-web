package main

import (
	"encoding/json"
	"net/http"
)

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	logMessage(INFO, "logoutHandler: Received logout request")
	session, _ := store.Get(r, "session")
	session.Values["authenticated"] = false
	session.Values["username"] = ""
	session.Values["usermemberid"] = ""
	session.Save(r, w)

	logMessage(INFO, "logoutHandler: Logout successful")
	response := Response{Message: "Logout successful"}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
