package main

import (
	"context"
	"os"
	"testing"

	"aura-backend/internal/config"
	"aura-backend/internal/models"
)

type mockAdminRepo struct {
	admins []*models.Admin
}

func (m *mockAdminRepo) GetByEmail(ctx context.Context, email string) (*models.Admin, error) {
	for _, a := range m.admins {
		if a.Email == email {
			return a, nil
		}
	}
	return nil, nil
}

func (m *mockAdminRepo) GetByID(ctx context.Context, id string) (*models.Admin, error) {
	for _, a := range m.admins {
		if a.ID == id {
			return a, nil
		}
	}
	return nil, nil
}

func (m *mockAdminRepo) Create(ctx context.Context, email, passwordHash string) (*models.Admin, error) {
	newAdmin := &models.Admin{
		ID:           "test-admin-id",
		Email:        email,
		PasswordHash: passwordHash,
	}
	m.admins = append(m.admins, newAdmin)
	return newAdmin, nil
}

func (m *mockAdminRepo) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
	for _, a := range m.admins {
		if a.ID == id {
			a.PasswordHash = passwordHash
			return nil
		}
	}
	return nil
}

func (m *mockAdminRepo) UpdateEmail(ctx context.Context, id string, email string) error {
	for _, a := range m.admins {
		if a.ID == id {
			a.Email = email
			return nil
		}
	}
	return nil
}

func (m *mockAdminRepo) Count(ctx context.Context) (int, error) {
	return len(m.admins), nil
}

func TestEnsureDefaultAdmin_PreservesExisting(t *testing.T) {
	existingHash := "$2a$10$customAdminChangedPasswordHashString"
	repo := &mockAdminRepo{
		admins: []*models.Admin{
			{
				ID:           "existing-uuid-1",
				Email:        "hani@aura.com",
				PasswordHash: existingHash,
			},
		},
	}

	cfg := &config.Config{
		ServerEnv: "production",
		JWTSecret: "test-secret-32-chars-long-minimum!",
	}

	// Should do nothing because count > 0
	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 1 {
		t.Fatalf("Expected 1 admin, found %d", len(repo.admins))
	}
	if repo.admins[0].PasswordHash != existingHash {
		t.Fatalf("Existing admin password hash was modified! Expected %s, got %s", existingHash, repo.admins[0].PasswordHash)
	}
}

func TestEnsureDefaultAdmin_ProductionDoesNotSeedHardcoded(t *testing.T) {
	repo := &mockAdminRepo{admins: []*models.Admin{}}
	cfg := &config.Config{
		ServerEnv: "production",
		JWTSecret: "test-secret-32-chars-long-minimum!",
	}

	os.Unsetenv("INITIAL_ADMIN_EMAIL")
	os.Unsetenv("INITIAL_ADMIN_PASSWORD")

	// Production with count == 0 and no env vars -> should NOT seed hardcoded credentials
	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 0 {
		t.Fatalf("Production seeded an admin when none should have been created! Found: %d", len(repo.admins))
	}
}

func TestEnsureDefaultAdmin_ProductionWithExplicitEnvVars(t *testing.T) {
	repo := &mockAdminRepo{admins: []*models.Admin{}}
	cfg := &config.Config{
		ServerEnv: "production",
		JWTSecret: "test-secret-32-chars-long-minimum!",
	}

	os.Setenv("INITIAL_ADMIN_EMAIL", "hani.founder@aurabyhani.com")
	os.Setenv("INITIAL_ADMIN_PASSWORD", "AuraSafeKey2026#")
	defer func() {
		os.Unsetenv("INITIAL_ADMIN_EMAIL")
		os.Unsetenv("INITIAL_ADMIN_PASSWORD")
	}()

	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 1 {
		t.Fatalf("Expected 1 admin seeded via env vars, got %d", len(repo.admins))
	}
	if repo.admins[0].Email != "hani.founder@aurabyhani.com" {
		t.Errorf("Expected hani.founder@aurabyhani.com, got %s", repo.admins[0].Email)
	}
}

func TestEnsureDefaultAdmin_DevelopmentSeedsConvenienceAdmin(t *testing.T) {
	repo := &mockAdminRepo{admins: []*models.Admin{}}
	cfg := &config.Config{
		ServerEnv: "development",
		JWTSecret: "dev-secret-32-chars-long-minimum!!",
	}

	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 1 {
		t.Fatalf("Expected 1 dev admin seeded, got %d", len(repo.admins))
	}
	if repo.admins[0].Email != "admin@aurabyhani.com" {
		t.Errorf("Expected admin@aurabyhani.com, got %s", repo.admins[0].Email)
	}
}
