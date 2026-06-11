package models

type Token struct {
    ID        int    `json:"id"`
    UserID    int    `json:"user_id"`
    TokenType string `json:"type"`
    Value     string `json:"value"`
}
