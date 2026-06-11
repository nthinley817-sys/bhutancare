package handlers

import (
	"bhutancare/config"
	"bhutancare/middleware"
	"encoding/json"
	"net/http"
	"golang.org/x/crypto/bcrypt"
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

	// Decode all possible fields
	var inp map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		jsonError(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// Fetch current values from DB
	var cur UserProfile
	config.DB.QueryRow(
		`SELECT phone, blood_group, COALESCE(dob::text,''),
		        dzongkhag, village, gender, height_cm, weight_kg
		 FROM users WHERE id=$1`, userID,
	).Scan(&cur.Phone, &cur.BloodGroup, &cur.DOB,
		&cur.Dzongkhag, &cur.Village, &cur.Gender,
		&cur.HeightCM, &cur.WeightKG)

	// Only overwrite fields that were actually sent
	getString := func(key, fallback string) string {
		if v, ok := inp[key]; ok && v != nil {
			if s, ok := v.(string); ok { return s }
		}
		return fallback
	}
	getInt := func(key string, fallback int) int {
		if v, ok := inp[key]; ok && v != nil {
			if f, ok := v.(float64); ok { return int(f) }
		}
		return fallback
	}
	getFloat := func(key string, fallback float64) float64 {
		if v, ok := inp[key]; ok && v != nil {
			if f, ok := v.(float64); ok { return f }
		}
		return fallback
	}

	phone      := getString("phone",       cur.Phone)
	bloodGroup := getString("blood_group", cur.BloodGroup)
	dzongkhag  := getString("dzongkhag",   cur.Dzongkhag)
	village    := getString("village",     cur.Village)
	gender     := getString("gender",      cur.Gender)
	dob        := getString("dob",         cur.DOB)
	heightCM   := getInt("height_cm",      cur.HeightCM)
	weightKG   := getFloat("weight_kg",    cur.WeightKG)

	_, err := config.DB.Exec(
		`UPDATE users SET
			phone=$1, blood_group=$2, dzongkhag=$3, village=$4,
			gender=$5, dob=NULLIF($6,'')::date,
			height_cm=$7, weight_kg=$8
		 WHERE id=$9`,
		phone, bloodGroup, dzongkhag, village,
		gender, dob, heightCM, weightKG, userID)

	if err != nil {
		jsonError(w, "Failed to update: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated"})
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var inp struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	json.NewDecoder(r.Body).Decode(&inp)

	if inp.CurrentPassword == "" || inp.NewPassword == "" {
		jsonError(w, "All fields required", http.StatusBadRequest)
		return
	}
	if len(inp.NewPassword) < 8 {
		jsonError(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	// Get current hashed password
	var hashedPass string
	err := config.DB.QueryRow(
		`SELECT password FROM users WHERE id=$1`, userID,
	).Scan(&hashedPass)
	if err != nil {
		jsonError(w, "User not found", http.StatusNotFound)
		return
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPass), []byte(inp.CurrentPassword)); err != nil {
		jsonError(w, "Current password is incorrect", http.StatusUnauthorized)
		return
	}

	// Hash new password
	newHashed, err := bcrypt.GenerateFromPassword([]byte(inp.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "Server error", http.StatusInternalServerError)
		return
	}

	// Update password
	config.DB.Exec(`UPDATE users SET password=$1 WHERE id=$2`, string(newHashed), userID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}
