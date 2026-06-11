package handlers

import (
    "encoding/json"
    "net/http"
)

type profile struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(profile{ID: 1, Name: "Demo User", Email: "demo@example.com"})
}
