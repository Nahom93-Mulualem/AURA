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

func (m *mockAdminRepo) GetByID(ctx context.Context, id string) (*models.Admin, error) {
	for _, admin := range m.admins {
		if admin.ID == id {
			return admin, nil
		}
	}
	return nil, nil
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

func (m *mockAdminRepo) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
	for _, admin := range m.admins {
		if admin.ID == id {
			admin.PasswordHash = passwordHash
			return nil
		}
	}
	return nil
}

func (m *mockAdminRepo) UpdateEmail(ctx context.Context, id string, email string) error {
	for oldEmail, admin := range m.admins {
		if admin.ID == id {
			delete(m.admins, oldEmail)
			admin.Email = email
			m.admins[email] = admin
			return nil
		}
	}
	return nil
}

func (m *mockAdminRepo) Count(ctx context.Context) (int, error) {
	return len(m.admins), nil
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

func TestAuthService_ChangePassword(t *testing.T) {
	repo := &mockAdminRepo{admins: make(map[string]*models.Admin)}
	jwtSecret := "test_secret_key_12345"
	svc := service.NewAuthService(repo, jwtSecret)
	ctx := context.Background()

	admin, err := svc.RegisterAdmin(ctx, "admin@aurabyhani.com", "InitialSecret2026!")
	if err != nil {
		t.Fatalf("failed to register admin: %v", err)
	}

	// 1. Wrong current password should fail
	err = svc.ChangePassword(ctx, admin.ID, "IncorrectOldPass!", "BrandNewSecurePassword2026!")
	if err == nil {
		t.Fatal("expected error for wrong current password, got nil")
	}

	// 2. Short new password (< 8 chars) should fail
	err = svc.ChangePassword(ctx, admin.ID, "InitialSecret2026!", "short")
	if err == nil {
		t.Fatal("expected error for short new password, got nil")
	}

	// 3. New password same as current should fail
	err = svc.ChangePassword(ctx, admin.ID, "InitialSecret2026!", "InitialSecret2026!")
	if err == nil {
		t.Fatal("expected error when new password equals current password, got nil")
	}

	// 4. Valid password change should succeed
	err = svc.ChangePassword(ctx, admin.ID, "InitialSecret2026!", "BrandNewSecurePassword2026!")
	if err != nil {
		t.Fatalf("unexpected error changing password: %v", err)
	}

	// 5. Old password must no longer work for login
	_, err = svc.Login(ctx, "admin@aurabyhani.com", "InitialSecret2026!")
	if err == nil {
		t.Fatal("expected login with old password to fail, but it succeeded")
	}

	// 6. New password must succeed for login
	authResp, err := svc.Login(ctx, "admin@aurabyhani.com", "BrandNewSecurePassword2026!")
	if err != nil {
		t.Fatalf("expected login with new password to succeed, got: %v", err)
	}
	if authResp.Token == "" {
		t.Fatal("expected non-empty token")
	}
}

func TestAuthService_UpdateEmail(t *testing.T) {
	repo := &mockAdminRepo{admins: make(map[string]*models.Admin)}
	jwtSecret := "test_secret_key_12345"
	svc := service.NewAuthService(repo, jwtSecret)
	ctx := context.Background()

	admin, err := svc.RegisterAdmin(ctx, "admin@aurabyhani.com", "SecretPass2026!")
	if err != nil {
		t.Fatalf("failed to register admin: %v", err)
	}

	// 1. Invalid email format should fail
	_, err = svc.UpdateEmail(ctx, admin.ID, "not-an-email")
	if err == nil {
		t.Fatal("expected error for invalid email format, got nil")
	}

	// 2. Valid email update should succeed
	updated, err := svc.UpdateEmail(ctx, admin.ID, "hani@aurabyhani.com")
	if err != nil {
		t.Fatalf("unexpected error updating email: %v", err)
	}
	if updated.Email != "hani@aurabyhani.com" {
		t.Fatalf("expected email to be hani@aurabyhani.com, got %s", updated.Email)
	}

	// 3. Admin can now log in with the new email
	_, err = svc.Login(ctx, "hani@aurabyhani.com", "SecretPass2026!")
	if err != nil {
		t.Fatalf("expected login with new email to succeed, got: %v", err)
	}
}
