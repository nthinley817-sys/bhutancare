package handlers

import (
	"bhutancare/config"
	"bhutancare/middleware"
	"bhutancare/models"
	"encoding/json"
	"net/http"
)

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		GetProfile(w, r)
	} else if r.Method == http.MethodPut {
		UpdateProfile(w, r)
	}
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var u models.User
	err := config.DB.QueryRow(
		`SELECT id, first_name, last_name, cid, email, phone,
		        blood_group, COALESCE(dob::text, ''), dzongkhag, village,
		        gender, height_cm, weight_kg, created_at
		 FROM users WHERE id = $1`, userID,
	).Scan(
		&u.ID, &u.FirstName, &u.LastName, &u.CID, &u.Email, &u.Phone,
		&u.BloodGroup, &u.DOB, &u.Dzongkhag, &u.Village,
		&u.Gender, &u.HeightCM, &u.WeightKG, &u.CreatedAt,
	)
	if err != nil {
		jsonError(w, "Profile not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var inp struct {
		Phone      string  `json:"phone"`
		BloodGroup string  `json:"blood_group"`
		Dzongkhag  string  `json:"dzongkhag"`
		Village    string  `json:"village"`
		Gender     string  `json:"gender"`
		HeightCM   int     `json:"height_cm"`
		WeightKG   float64 `json:"weight_kg"`
	}
	json.NewDecoder(r.Body).Decode(&inp)
	config.DB.Exec(
		`UPDATE users SET phone=$1, blood_group=$2, dzongkhag=$3,
		 village=$4, gender=$5, height_cm=$6, weight_kg=$7 WHERE id=$8`,
		inp.Phone, inp.BloodGroup, inp.Dzongkhag,
		inp.Village, inp.Gender, inp.HeightCM, inp.WeightKG, userID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated"})
}
