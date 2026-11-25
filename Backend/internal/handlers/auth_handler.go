package handlers

import (
	"encoding/json"
	"net/http"

	"aura-backend/internal/config"
	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
	cfg         *config.Config
}

func NewAuthHandler(authService service.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		cfg:         cfg,
	}
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

	// Dynamic SSL/TLS detection (r.TLS or reverse proxy headers X-Forwarded-Proto)
	isSecure := false
	if h.cfg != nil && h.cfg.CookieSecure {
		isSecure = true
	}
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" || r.Header.Get("X-Forwarded-Ssl") == "on" {
		isSecure = true
	}

	cookieDomain := ""
	if h.cfg != nil {
		cookieDomain = h.cfg.CookieDomain
	}

	// Set HttpOnly, SameSite session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "aura_admin_token",
		Value:    authResp.Token,
		Path:     "/",
		Domain:   cookieDomain,
		HttpOnly: true,
		Secure:   isSecure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400, // 24 hours
	})

	SendJSON(w, http.StatusOK, authResp)
}

// Logout handles POST /api/v1/admin/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookieDomain := ""
	if h.cfg != nil {
		cookieDomain = h.cfg.CookieDomain
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "aura_admin_token",
		Value:    "",
		Path:     "/",
		Domain:   cookieDomain,
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

// ChangePassword handles POST /api/v1/admin/change-password (Admin protected)
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(models.AdminContextKey).(*models.JWTClaims)
	if !ok || claims == nil {
		SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.authService.ChangePassword(r.Context(), claims.AdminID, req.CurrentPassword, req.NewPassword); err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, map[string]string{
		"message": "Password updated successfully",
	})
}

// UpdateProfile handles PUT /api/v1/admin/profile (Admin protected)
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(models.AdminContextKey).(*models.JWTClaims)
	if !ok || claims == nil {
		SendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.UpdateEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	admin, err := h.authService.UpdateEmail(r.Context(), claims.AdminID, req.Email)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, map[string]string{
		"id":    admin.ID,
		"email": admin.Email,
	})
}
