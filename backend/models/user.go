package models

import "time"

type User struct {
	ID         int       `json:"id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	CID        string    `json:"cid"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	BloodGroup string    `json:"blood_group"`
	DOB        string    `json:"dob"`
	Dzongkhag  string    `json:"dzongkhag"`
	Village    string    `json:"village"`
	Gender     string    `json:"gender"`
	HeightCM   int       `json:"height_cm"`
	WeightKG   float64   `json:"weight_kg"`
	CreatedAt  time.Time `json:"created_at"`
}

type RegisterInput struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	CID       string `json:"cid"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Password  string `json:"password"`
}

type LoginInput struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}
