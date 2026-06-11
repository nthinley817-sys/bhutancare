package handlers

import (
    "encoding/json"
    "net/http"
)

type appointment struct {
    ID     int    `json:"id"`
    UserID int    `json:"user_id"`
    Date   string `json:"date"`
    Notes  string `json:"notes"`
}

func AppointmentsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    appointments := []appointment{{ID: 1, UserID: 1, Date: "2026-06-10", Notes: "Annual checkup"}}
    json.NewEncoder(w).Encode(appointments)
}
