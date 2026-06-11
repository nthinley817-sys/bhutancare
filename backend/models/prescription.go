package models

import "time"

type Prescription struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id,omitempty"`
	RxNumber   string    `json:"rx_number"`
	Doctor     string    `json:"doctor"`
	Hospital   string    `json:"hospital"`
	IssuedDate string    `json:"issued_date"`
	ValidUntil string    `json:"valid_until"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
}
