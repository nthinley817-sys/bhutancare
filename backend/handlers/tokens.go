package handlers

import (
    "encoding/json"
    "net/http"
)

type tokenItem struct {
    ID        int    `json:"id"`
    UserID    int    `json:"user_id"`
    TokenType string `json:"type"`
    Value     string `json:"value"`
}

func TokensHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    tokens := []tokenItem{{ID: 1, UserID: 1, TokenType: "api", Value: "token-123"}}
    json.NewEncoder(w).Encode(tokens)
}
