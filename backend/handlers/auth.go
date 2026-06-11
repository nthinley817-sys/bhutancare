package handlers

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type authResponse struct {
	Message string      `json:"message"`
	Token   string      `json:"token,omitempty"`
	User    interface{} `json:"user,omitempty"`
}

type loginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

func makeJWTLikeToken(payload interface{}) string {
	header := `{"alg":"none","typ":"JWT"}`
	pb, _ := json.Marshal(payload)
	// use RawURLEncoding to produce base64url without padding
	h := base64.RawURLEncoding.EncodeToString([]byte(header))
	p := base64.RawURLEncoding.EncodeToString(pb)
	// signature can be empty or dummy since frontend only decodes payload
	s := "dummy"
	return strings.Join([]string{h, p, s}, ".")
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req loginRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	// build a simple user object from the identifier
	name := "User"
	email := req.Identifier
	if strings.Contains(req.Identifier, "@") {
		parts := strings.Split(req.Identifier, "@")
		name = strings.Title(strings.ReplaceAll(parts[0], ".", " "))
	} else if req.Identifier != "" {
		name = req.Identifier
	}

	// create a payload with exp so frontend's parseJwt/requireAuth accepts it
	payload := map[string]interface{}{
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"name":  name,
		"email": email,
	}

	token := makeJWTLikeToken(payload)

	user := map[string]interface{}{
		"name":  name,
		"email": email,
	}

	json.NewEncoder(w).Encode(authResponse{Message: "login successful", Token: token, User: user})
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// accept registration payload but don't persist for now
	var payload map[string]interface{}
	_ = json.NewDecoder(r.Body).Decode(&payload)
	json.NewEncoder(w).Encode(authResponse{Message: "register successful"})
}
