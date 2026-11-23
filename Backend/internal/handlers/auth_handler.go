package handlers

import (
	"encoding/json"
	"net/http"

	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login handles POST /api/v1/admin/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	authResp, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		SendError(w, http.StatusUnauthorized, err.Error())
		return
	}

	// Set HttpOnly, SameSite session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "aura_admin_token",
		Value:    authResp.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400, // 24 hours
	})

	SendJSON(w, http.StatusOK, authResp)
}

// Logout handles POST /api/v1/admin/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "aura_admin_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})
	SendJSON(w, http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}

// Me handles GET /api/v1/admin/me (Admin protected)
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(models.AdminContextKey).(*models.JWTClaims)
	if !ok || claims == nil {
		SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	SendJSON(w, http.StatusOK, map[string]string{
		"id":    claims.AdminID,
		"email": claims.Email,
	})
}
