package middleware

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"aura-backend/internal/handlers"
	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

// isOriginAllowed checks if the incoming origin/referer matches configured allowed origins
func isOriginAllowed(requestOrigin string, allowedOrigins []string) bool {
	if requestOrigin == "" {
		return false
	}
	parsedOrigin, err := url.Parse(requestOrigin)
	if err != nil {
		return false
	}
	normalizedOrigin := strings.ToLower(parsedOrigin.Scheme + "://" + parsedOrigin.Host)

	for _, allowed := range allowedOrigins {
		parsedAllowed, err := url.Parse(allowed)
		if err == nil {
			if strings.ToLower(parsedAllowed.Scheme+"://"+parsedAllowed.Host) == normalizedOrigin {
				return true
			}
		} else if strings.EqualFold(allowed, normalizedOrigin) {
			return true
		}
	}
	return false
}

func RequireAuth(authService service.AuthService, allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := ""
			fromCookie := false

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
					fromCookie = true
				}
			}

			if tokenString == "" {
				handlers.SendError(w, http.StatusUnauthorized, "Authentication required. Please sign in.")
				return
			}

			// 3. CSRF Protection for ambient cookie-authenticated mutating requests
			if fromCookie && (r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodPatch || r.Method == http.MethodDelete) {
				reqOrigin := r.Header.Get("Origin")
				if reqOrigin == "" {
					// Fall back to Referer header if Origin not set
					reqOrigin = r.Header.Get("Referer")
				}

				if !isOriginAllowed(reqOrigin, allowedOrigins) {
					handlers.SendError(w, http.StatusForbidden, "Cross-site request blocked: untrusted origin.")
					return
				}
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
