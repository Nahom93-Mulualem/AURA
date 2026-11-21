package middleware

import (
	"context"
	"net/http"
	"strings"

	"aura-backend/internal/handlers"
	"aura-backend/internal/service"
)

type contextKey string
const AdminContextKey contextKey = "adminClaims"

func RequireAuth(authService service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				handlers.SendError(w, http.StatusUnauthorized, "Missing Authorization header")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				handlers.SendError(w, http.StatusUnauthorized, "Invalid Authorization format. Expected: Bearer <token>")
				return
			}

			tokenString := parts[1]
			claims, err := authService.ValidateToken(tokenString)
			if err != nil {
				handlers.SendError(w, http.StatusUnauthorized, "Invalid or expired token")
				return
			}

			// Attach claims to context
			ctx := context.WithValue(r.Context(), AdminContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
