package service

import (
	"context"
	"errors"
	"fmt"
	"log"
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
	ChangePassword(ctx context.Context, adminID, currentPassword, newPassword string) error
	UpdateEmail(ctx context.Context, adminID, newEmail string) (*models.Admin, error)
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
		log.Println("Notice [AUTH DIAGNOSTIC] Database lookup failed")
		return nil, err
	}
	if admin == nil {
		log.Println("Notice [AUTH DIAGNOSTIC] Administrator not found")
		return nil, errors.New("invalid email or password")
	}

	// Verify password hash
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(password)); err != nil {
		log.Println("Notice [AUTH DIAGNOSTIC] Administrator found; password comparison failed")
		return nil, errors.New("invalid email or password")
	}

	log.Println("✓ [AUTH DIAGNOSTIC] Password comparison succeeded")

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

func (s *authService) ChangePassword(ctx context.Context, adminID, currentPassword, newPassword string) error {
	adminID = strings.TrimSpace(adminID)
	if adminID == "" {
		return errors.New("admin ID is required")
	}
	if currentPassword == "" {
		return errors.New("current password is required")
	}
	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}
	if currentPassword == newPassword {
		return errors.New("new password must be different from current password")
	}

	admin, err := s.adminRepo.GetByID(ctx, adminID)
	if err != nil {
		return err
	}
	if admin == nil {
		return errors.New("admin account not found")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(currentPassword)); err != nil {
		return errors.New("incorrect current password")
	}

	// Hash and update new password
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.adminRepo.UpdatePassword(ctx, adminID, newHash)
}

func (s *authService) UpdateEmail(ctx context.Context, adminID, newEmail string) (*models.Admin, error) {
	adminID = strings.TrimSpace(adminID)
	if adminID == "" {
		return nil, errors.New("admin ID is required")
	}

	newEmail = strings.TrimSpace(strings.ToLower(newEmail))
	if newEmail == "" || !strings.Contains(newEmail, "@") || !strings.Contains(newEmail, ".") {
		return nil, errors.New("valid email address is required")
	}

	admin, err := s.adminRepo.GetByID(ctx, adminID)
	if err != nil {
		return nil, err
	}
	if admin == nil {
		return nil, errors.New("admin account not found")
	}

	if admin.Email == newEmail {
		return admin, nil // unchanged
	}

	// Check if another admin already uses this email
	existing, err := s.adminRepo.GetByEmail(ctx, newEmail)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID != adminID {
		return nil, errors.New("email is already in use by another administrator")
	}

	if err := s.adminRepo.UpdateEmail(ctx, adminID, newEmail); err != nil {
		return nil, err
	}

	admin.Email = newEmail
	return admin, nil
}
