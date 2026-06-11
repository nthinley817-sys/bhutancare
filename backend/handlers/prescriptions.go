package handlers

import (
    "encoding/json"
    "net/http"
)

type prescription struct {
    ID       int    `json:"id"`
    UserID   int    `json:"user_id"`
    Medicine string `json:"medicine"`
    Dose     string `json:"dose"`
}

func PrescriptionsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    prescriptions := []prescription{{ID: 1, UserID: 1, Medicine: "Amoxicillin", Dose: "500mg"}}
    json.NewEncoder(w).Encode(prescriptions)
}
