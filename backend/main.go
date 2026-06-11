package main

import (
	"bhutancare/config"
	"bhutancare/routes"
	"log"
	"net/http"
	"os"
)

func main() {
	// Connect to PostgreSQL
	config.ConnectDB()

	// Run migrations
	config.RunMigrations()

	// Setup routes
	router := routes.Setup()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 BhutanCare API running → http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
