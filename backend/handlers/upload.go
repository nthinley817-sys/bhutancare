package handlers

import (
	"bhutancare/config"
	"bhutancare/middleware"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
)

func UploadProfilePic(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	// Parse multipart form (max 5MB)
	r.ParseMultipartForm(5 << 20)

	file, header, err := r.FormFile("profile_pic")
	if err != nil {
		jsonError(w, "No file uploaded", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Check file type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		jsonError(w, "Only image files allowed", http.StatusBadRequest)
		return
	}

	// Read file and convert to base64
	data, err := io.ReadAll(file)
	if err != nil {
		jsonError(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Store as base64 data URL
	base64Str := "data:" + contentType + ";base64," + base64.StdEncoding.EncodeToString(data)

	// Save to database
	_, err = config.DB.Exec(
		`UPDATE users SET profile_pic=$1 WHERE id=$2`,
		base64Str, userID)
	if err != nil {
		jsonError(w, "Failed to save picture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":     "Profile picture updated!",
		"profile_pic": base64Str,
	})
}
