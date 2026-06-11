package models

import "time"

type Appointment struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id,omitempty"`
	Hospital   string    `json:"hospital"`
	Department string    `json:"department"`
	Doctor     string    `json:"doctor"`
	ApptDate   string    `json:"appt_date"`
	ApptTime   string    `json:"appt_time"`
	Status     string    `json:"status"`
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
}
