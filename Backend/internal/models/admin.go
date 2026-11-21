package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Admin struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never output in JSON responses
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token     string `json:"token"`
	AdminUser Admin  `json:"admin"`
}

type JWTClaims struct {
	AdminID string `json:"adminId"`
	Email   string `json:"email"`
	jwt.RegisteredClaims
}
