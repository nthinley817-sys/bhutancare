package routes

import (
	"bhutancare/handlers"
	"bhutancare/middleware"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func Setup() http.Handler {
	r := mux.NewRouter()

	// Redirect root to homepage
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/pages/homepage.html", http.StatusFound)
	}).Methods("GET")

	// Public routes
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/login",    handlers.LoginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/google",          handlers.GoogleLogin).Methods("GET")
	r.HandleFunc("/api/auth/google/callback", handlers.GoogleCallback).Methods("GET")
	r.HandleFunc("/api/auth/forgot-password", handlers.ForgotPassword).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/verify-otp",      handlers.VerifyOTP).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/reset-password",  handlers.ResetPassword).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/forgot-password", handlers.ForgotPassword).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/verify-otp",      handlers.VerifyOTP).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/reset-password",  handlers.ResetPassword).Methods("POST", "OPTIONS")

	// Protected routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.RequireAuth)
	api.HandleFunc("/profile",           handlers.ProfileHandler).Methods("GET", "PUT")
	api.HandleFunc("/profile/password",  handlers.ChangePassword).Methods("PUT")
	api.HandleFunc("/profile/picture",   handlers.UploadProfilePic).Methods("POST")
	api.HandleFunc("/appointments",      handlers.AppointmentsHandler).Methods("GET", "POST")
	api.HandleFunc("/tokens",            handlers.TokensHandler).Methods("GET", "POST")
	api.HandleFunc("/prescriptions",     handlers.PrescriptionsHandler).Methods("GET", "POST")

	// Serve frontend
	frontendPath := os.Getenv("FRONTEND_PATH")
	if frontendPath == "" {
		frontendPath = "../frontend"
	}
	log.Println("Frontend path:", frontendPath)
	frontend := http.FileServer(http.Dir(frontendPath))
	r.PathPrefix("/").Handler(frontend)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})
	return c.Handler(r)
}
