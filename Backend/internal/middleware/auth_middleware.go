package middleware

import (
	"context"
	"net/http"
	"strings"

	"aura-backend/internal/handlers"
	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

func RequireAuth(authService service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := ""

			// 1. Check Authorization Bearer header
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				parts := strings.Split(authHeader, " ")
				if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
					tokenString = parts[1]
				}
			}

			// 2. Fall back to secure HttpOnly cookie
			if tokenString == "" {
				if cookie, err := r.Cookie("aura_admin_token"); err == nil && cookie.Value != "" {
					tokenString = cookie.Value
				}
			}

			if tokenString == "" {
				handlers.SendError(w, http.StatusUnauthorized, "Authentication required. Please sign in.")
				return
			}

			claims, err := authService.ValidateToken(tokenString)
			if err != nil {
				handlers.SendError(w, http.StatusUnauthorized, "Invalid or expired session. Please sign in again.")
				return
			}

			// Attach claims to context
			ctx := context.WithValue(r.Context(), models.AdminContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
