package models

import "time"

type Token struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id,omitempty"`
	Hospital   string    `json:"hospital"`
	Department string    `json:"department"`
	TokenNum   string    `json:"token_num"`
	Status     string    `json:"status"`
	IssuedAt   time.Time `json:"issued_at,omitempty"`
}
