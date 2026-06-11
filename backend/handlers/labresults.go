package handlers

import (
    "encoding/json"
    "net/http"
)

type labResult struct {
    ID      int    `json:"id"`
    UserID  int    `json:"user_id"`
    Test    string `json:"test"`
    Result  string `json:"result"`
    Date    string `json:"date"`
}

func LabResultsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    results := []labResult{{ID: 1, UserID: 1, Test: "Blood sugar", Result: "Normal", Date: "2026-06-10"}}
    json.NewEncoder(w).Encode(results)
}
