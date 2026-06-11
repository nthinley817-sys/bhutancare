package routes

import (
	"net/http"

	"my-app/backend/handlers"
	"my-app/backend/middleware"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// auth endpoints used by frontend
	mux.HandleFunc("/api/auth/login", handlers.LoginHandler)
	mux.HandleFunc("/api/auth/register", handlers.RegisterHandler)
	// keep legacy routes for compatibility
	mux.HandleFunc("/api/login", handlers.LoginHandler)
	mux.HandleFunc("/api/register", handlers.RegisterHandler)
	mux.Handle("/api/appointments", middleware.RequireAuth(http.HandlerFunc(handlers.AppointmentsHandler)))
	mux.Handle("/api/tokens", middleware.RequireAuth(http.HandlerFunc(handlers.TokensHandler)))
	mux.Handle("/api/prescriptions", middleware.RequireAuth(http.HandlerFunc(handlers.PrescriptionsHandler)))
	mux.Handle("/api/labresults", middleware.RequireAuth(http.HandlerFunc(handlers.LabResultsHandler)))
	mux.Handle("/api/profile", middleware.RequireAuth(http.HandlerFunc(handlers.ProfileHandler)))

	return mux
}
