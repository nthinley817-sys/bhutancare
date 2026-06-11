package handlers

import (
	"bhutancare/config"
	"bhutancare/middleware"
	"encoding/json"
	"net/http"
	"time"
)

type UserProfile struct {
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

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getProfile(w, r)
	} else if r.Method == http.MethodPut {
		updateProfile(w, r)
	}
}

func getProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var u UserProfile
	err := config.DB.QueryRow(
		`SELECT id, first_name, last_name, cid, email, phone,
		        blood_group, COALESCE(dob::text, ''), dzongkhag, village,
		        gender, height_cm, weight_kg, created_at
		 FROM users WHERE id = $1`, userID,
	).Scan(&u.ID, &u.FirstName, &u.LastName, &u.CID, &u.Email, &u.Phone,
		&u.BloodGroup, &u.DOB, &u.Dzongkhag, &u.Village,
		&u.Gender, &u.HeightCM, &u.WeightKG, &u.CreatedAt)
	if err != nil {
		jsonError(w, "Profile not found: "+err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func updateProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var inp struct {
		Phone      string  `json:"phone"`
		BloodGroup string  `json:"blood_group"`
		Dzongkhag  string  `json:"dzongkhag"`
		Village    string  `json:"village"`
		Gender     string  `json:"gender"`
		DOB        string  `json:"dob"`
		HeightCM   int     `json:"height_cm"`
		WeightKG   float64 `json:"weight_kg"`
	}
	json.NewDecoder(r.Body).Decode(&inp)

	_, err := config.DB.Exec(
		`UPDATE users SET
			phone=$1, blood_group=$2, dzongkhag=$3, village=$4,
			gender=$5, height_cm=$6, weight_kg=$7,
			dob=NULLIF($8,'')::date
		 WHERE id=$9`,
		inp.Phone, inp.BloodGroup, inp.Dzongkhag, inp.Village,
		inp.Gender, inp.HeightCM, inp.WeightKG, inp.DOB, userID)

	if err != nil {
		jsonError(w, "Failed to update: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated"})
}
