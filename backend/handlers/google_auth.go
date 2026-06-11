package handlers

import (
	"bhutancare/config"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOAuthConfig = &oauth2.Config{
	ClientID:     "407997462190-2nhv41jdmdhp69l484hmsob2v7rbdo00.apps.googleusercontent.com",
	ClientSecret: "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",
	RedirectURL:  "http://localhost:8080/api/auth/google/callback",
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

// GET /api/auth/google - redirect to Google
func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := googleOAuthConfig.AuthCodeURL("bhutancare-state", oauth2.AccessTypeOnline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GET /api/auth/google/callback
func GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
		return
	}

	// Exchange code for token
	token, err := googleOAuthConfig.Exchange(r.Context(), code)
	if err != nil {
		fmt.Println("Token exchange error:", err)
		http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
		return
	}

	// Get user info from Google
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var googleUser struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		FirstName string `json:"given_name"`
		LastName  string `json:"family_name"`
		Picture   string `json:"picture"`
	}
	json.Unmarshal(body, &googleUser)

	if googleUser.Email == "" {
		http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
		return
	}

	// Check if user exists, if not create them
	var userID int
	var firstName, lastName string
	err = config.DB.QueryRow(
		`SELECT id, first_name, last_name FROM users WHERE email = $1`,
		strings.ToLower(googleUser.Email),
	).Scan(&userID, &firstName, &lastName)

	if err != nil {
		// Create new user from Google account
		cid := "GOOGLE-" + googleUser.ID[:8]
		err = config.DB.QueryRow(
			`INSERT INTO users (first_name, last_name, cid, email, phone, password, profile_pic)
			 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
			googleUser.FirstName, googleUser.LastName, cid,
			strings.ToLower(googleUser.Email), "", "google-oauth", googleUser.Picture,
		).Scan(&userID)
		if err != nil {
			fmt.Println("Create user error:", err)
			http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
			return
		}
		firstName = googleUser.FirstName
		lastName  = googleUser.LastName
	} else {
		// Update profile pic if from Google
		if googleUser.Picture != "" {
			config.DB.Exec(`UPDATE users SET profile_pic=$1 WHERE id=$2`, googleUser.Picture, userID)
		}
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" { secret = "bhutancare_super_secret_key_2026" }

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"email":   googleUser.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenStr, err := jwtToken.SignedString([]byte(secret))
	if err != nil {
		http.Redirect(w, r, "/pages/login.html?error=google_failed", http.StatusTemporaryRedirect)
		return
	}

	// Redirect to dashboard with token
	name := firstName + " " + lastName
	redirectURL := fmt.Sprintf(
		"/pages/dashboard.html#google_token=%s&name=%s&email=%s&pic=%s",
		tokenStr, name, googleUser.Email, googleUser.Picture,
	)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}
