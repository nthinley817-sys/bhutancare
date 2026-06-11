package main

import (
    "log"
    "net/http"

    "my-app/backend/routes"
)

func main() {
    mux := routes.SetupRoutes()
    log.Println("backend listening on :8080")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
