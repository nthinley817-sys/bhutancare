package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"bhutancare/config"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

type otpEntry struct {
	Code      string
	ExpiresAt time.Time
}

var (
	otpStore = map[string]otpEntry{}
	otpMu    sync.Mutex
)

func generateOTP() string {
	b := make([]byte, 3)
	rand.Read(b)
	n := (int(b[0])<<16 | int(b[1])<<8 | int(b[2])) % 1000000
	return fmt.Sprintf("%06d", n)
}

func sendOTPEmail(toEmail, otp string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "nthinley817@gmail.com")
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "BhutanCare — Your OTP Code")
	m.SetBody("text/html", fmt.Sprintf(`
	<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb">
		<h2 style="color:#1a4731">🏥 BhutanCare Password Reset</h2>
		<p style="color:#555">Use this OTP to reset your password. Expires in <strong>10 minutes</strong>.</p>
		<div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#2d8653;background:#f0faf4;padding:20px;border-radius:8px;text-align:center;margin:24px 0">%s</div>
		<p style="color:#888;font-size:13px">If you didn't request this, ignore this email.</p>
	</div>`, otp))

	d := gomail.NewDialer("smtp.gmail.com", 587, "nthinley817@gmail.com", "ivfu bpjf evoj feuw")
	return d.DialAndSend(m)
}

// POST /api/auth/forgot-password
func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var inp struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil || inp.Email == "" {
		jsonError(w, "Email required", http.StatusBadRequest)
		return
	}

	var userID int
	err := config.DB.QueryRow(`SELECT id FROM users WHERE email = $1`, inp.Email).Scan(&userID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "If that email exists, an OTP has been sent."})
		return
	}

	otp := generateOTP()
	otpMu.Lock()
	otpStore[inp.Email] = otpEntry{Code: otp, ExpiresAt: time.Now().Add(10 * time.Minute)}
	otpMu.Unlock()

	if err := sendOTPEmail(inp.Email, otp); err != nil {
		fmt.Println("Email error:", err)
		jsonError(w, "Failed to send OTP: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "OTP sent to your email."})
}

// POST /api/auth/verify-otp
func VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var inp struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil {
		jsonError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	otpMu.Lock()
	entry, ok := otpStore[inp.Email]
	otpMu.Unlock()

	if !ok || entry.Code != inp.OTP || time.Now().After(entry.ExpiresAt) {
		jsonError(w, "Invalid or expired OTP", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "OTP verified.", "email": inp.Email})
}

// POST /api/auth/reset-password
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var inp struct {
		Email    string `json:"email"`
		OTP      string `json:"otp"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&inp); err != nil || inp.Password == "" {
		jsonError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if len(inp.Password) < 8 {
		jsonError(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	otpMu.Lock()
	entry, ok := otpStore[inp.Email]
	otpMu.Unlock()

	if !ok || entry.Code != inp.OTP || time.Now().After(entry.ExpiresAt) {
		jsonError(w, "Invalid or expired OTP", http.StatusUnauthorized)
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(inp.Password), 12)
	if err != nil {
		jsonError(w, "Server error", http.StatusInternalServerError)
		return
	}

	_, err = config.DB.Exec(`UPDATE users SET password=$1 WHERE email=$2`, string(hashed), inp.Email)
	if err != nil {
		jsonError(w, "Failed to update password", http.StatusInternalServerError)
		return
	}

	otpMu.Lock()
	delete(otpStore, inp.Email)
	otpMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password reset successfully."})
}
