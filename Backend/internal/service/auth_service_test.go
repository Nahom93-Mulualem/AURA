package service_test

import (
	"context"
	"testing"

	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

type mockAdminRepo struct {
	admins map[string]*models.Admin
}

func (m *mockAdminRepo) GetByEmail(ctx context.Context, email string) (*models.Admin, error) {
	admin, exists := m.admins[email]
	if !exists {
		return nil, nil
	}
	return admin, nil
}

func (m *mockAdminRepo) Create(ctx context.Context, email, passwordHash string) (*models.Admin, error) {
	admin := &models.Admin{
		ID:           "admin-123",
		Email:        email,
		PasswordHash: passwordHash,
	}
	m.admins[email] = admin
	return admin, nil
}

func TestAuthService_PasswordHashingAndJWT(t *testing.T) {
	repo := &mockAdminRepo{admins: make(map[string]*models.Admin)}
	jwtSecret := "test_secret_key_12345"
	svc := service.NewAuthService(repo, jwtSecret)
	ctx := context.Background()

	// 1. Register admin
	email := "hani@aurabyhani.com"
	rawPassword := "SecureAuraPass2026!"
	admin, err := svc.RegisterAdmin(ctx, email, rawPassword)
	if err != nil {
		t.Fatalf("failed to register admin: %v", err)
	}

	if admin.PasswordHash == rawPassword {
		t.Fatal("password hash must never equal raw password")
	}

	// 2. Test Login with valid password
	authResp, err := svc.Login(ctx, email, rawPassword)
	if err != nil {
		t.Fatalf("expected login to succeed, got error: %v", err)
	}
	if authResp.Token == "" {
		t.Fatal("expected JWT token to be non-empty")
	}

	// 3. Test ValidateToken
	claims, err := svc.ValidateToken(authResp.Token)
	if err != nil {
		t.Fatalf("expected token validation to succeed, got error: %v", err)
	}
	if claims.Email != email {
		t.Fatalf("expected claims email to be %s, got %s", email, claims.Email)
	}

	// 4. Test Login with wrong password
	_, err = svc.Login(ctx, email, "WrongPassword!")
	if err == nil {
		t.Fatal("expected login with wrong password to fail, got nil")
	}
}
