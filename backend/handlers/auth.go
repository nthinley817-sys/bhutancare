package handlers

import (
	"bhutancare/config"
	"bhutancare/models"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var inp models.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if inp.FirstName == "" || inp.LastName == "" || inp.CID == "" || inp.Email == "" || inp.Password == "" {
		jsonError(w, "All fields are required", http.StatusBadRequest)
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(inp.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "Server error", http.StatusInternalServerError)
		return
	}
	var id int
	err = config.DB.QueryRow(
		`INSERT INTO users (first_name, last_name, cid, email, phone, password)
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		inp.FirstName, inp.LastName, inp.CID,
		strings.ToLower(inp.Email), inp.Phone, string(hashed),
	).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			jsonError(w, "Email or CID already registered", http.StatusConflict)
			return
		}
		jsonError(w, "Failed to create account: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "message": "Account created successfully"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var inp models.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	var id int
	var firstName, lastName, hashedPass, email string
	err := config.DB.QueryRow(
		`SELECT id, first_name, last_name, email, password
		 FROM users WHERE email = $1 OR cid = $1`,
		strings.ToLower(inp.Identifier),
	).Scan(&id, &firstName, &lastName, &email, &hashedPass)
	if err != nil {
		jsonError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPass), []byte(inp.Password)); err != nil {
		jsonError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"email":   email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		jsonError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenStr,
		"user":  map[string]interface{}{"id": id, "name": firstName + " " + lastName, "email": email},
	})
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
