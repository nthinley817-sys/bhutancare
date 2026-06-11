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

	// Redirect root to homepage
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/pages/homepage.html", http.StatusFound)
	}).Methods("GET")

	// Public routes
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/login",    handlers.LoginHandler).Methods("POST", "OPTIONS")

	// Protected routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.RequireAuth)
	api.HandleFunc("/profile",       handlers.ProfileHandler).Methods("GET", "PUT")
	api.HandleFunc("/appointments",  handlers.AppointmentsHandler).Methods("GET", "POST")
	api.HandleFunc("/tokens",        handlers.TokensHandler).Methods("GET", "POST")
	api.HandleFunc("/prescriptions", handlers.PrescriptionsHandler).Methods("GET", "POST")

	// Serve frontend static files
	frontend := http.FileServer(http.Dir("/workspaces/my-app/frontend/"))
	r.PathPrefix("/").Handler(frontend)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})
	return c.Handler(r)
}
