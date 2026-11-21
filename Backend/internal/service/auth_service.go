package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"aura-backend/internal/models"
	"aura-backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(ctx context.Context, email, password string) (*models.AuthResponse, error)
	ValidateToken(tokenString string) (*models.JWTClaims, error)
	HashPassword(password string) (string, error)
	RegisterAdmin(ctx context.Context, email, password string) (*models.Admin, error)
}

type authService struct {
	adminRepo repository.AdminRepository
	jwtSecret []byte
}

func NewAuthService(adminRepo repository.AdminRepository, jwtSecret string) AuthService {
	return &authService{
		adminRepo: adminRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *authService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(bytes), nil
}

func (s *authService) Login(ctx context.Context, email, password string) (*models.AuthResponse, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || password == "" {
		return nil, errors.New("email and password are required")
	}

	admin, err := s.adminRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify password hash
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Issue JWT token (expires in 24 hours)
	claims := &models.JWTClaims{
		AdminID: admin.ID,
		Email:   admin.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   admin.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign JWT token: %w", err)
	}

	return &models.AuthResponse{
		Token:     tokenString,
		AdminUser: *admin,
	}, nil
}

func (s *authService) ValidateToken(tokenString string) (*models.JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(*models.JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func (s *authService) RegisterAdmin(ctx context.Context, email, password string) (*models.Admin, error) {
	hash, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}
	return s.adminRepo.Create(ctx, email, hash)
}
