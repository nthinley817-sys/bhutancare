package main

import (
    "log"
    "net/http"

    "bhutancare/routes"
)

func main() {
    mux := routes.Setup()
    log.Println("backend listening on :8080")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatal(err)
    }
}
