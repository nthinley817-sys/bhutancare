package middleware

import "net/http"

func RequireAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Authorization") == "" {
            w.WriteHeader(http.StatusUnauthorized)
            w.Write([]byte(`{"error":"missing authorization header"}`))
            return
        }
        next.ServeHTTP(w, r)
    })
}
