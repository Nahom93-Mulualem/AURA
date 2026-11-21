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

	SendJSON(w, http.StatusOK, authResp)
}
