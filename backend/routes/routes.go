package routes

import (
	"bhutancare/handlers"
	"bhutancare/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func Setup() http.Handler {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/login",    handlers.LoginHandler).Methods("POST", "OPTIONS")

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
	frontend := http.FileServer(http.Dir("/workspaces/my-app/frontend/"))
	r.PathPrefix("/").Handler(frontend)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})
	return c.Handler(r)
}
