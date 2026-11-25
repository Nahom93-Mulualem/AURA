package main

import (
	"context"
	"net/http"
	"os"
	"testing"
	"time"

	"aura-backend/internal/config"
	"aura-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
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

func TestNewHTTPServer_Timeouts(t *testing.T) {
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})
	server := newHTTPServer("8080", dummyHandler)

	if server.Addr != ":8080" {
		t.Errorf("Expected Addr :8080, got %s", server.Addr)
	}
	if server.ReadHeaderTimeout != 5*time.Second {
		t.Errorf("Expected ReadHeaderTimeout 5s, got %v", server.ReadHeaderTimeout)
	}
	if server.ReadTimeout != 30*time.Second {
		t.Errorf("Expected ReadTimeout 30s, got %v", server.ReadTimeout)
	}
	if server.WriteTimeout != 60*time.Second {
		t.Errorf("Expected WriteTimeout 60s, got %v", server.WriteTimeout)
	}
	if server.IdleTimeout != 60*time.Second {
		t.Errorf("Expected IdleTimeout 60s, got %v", server.IdleTimeout)
	}
}

func TestEnsureDefaultAdmin_PreservesExactPassword(t *testing.T) {
	repo := &mockAdminRepo{admins: []*models.Admin{}}
	cfg := &config.Config{
		ServerEnv: "production",
		JWTSecret: "test-secret-32-chars-long-minimum!",
	}

	// Exact password with leading/trailing spaces
	exactPassWithSpaces := "  SecretWithLeadingAndTrailingSpaces!  "
	os.Setenv("INITIAL_ADMIN_EMAIL", "exact.pass@aurabyhani.com")
	os.Setenv("INITIAL_ADMIN_PASSWORD", exactPassWithSpaces)
	defer func() {
		os.Unsetenv("INITIAL_ADMIN_EMAIL")
		os.Unsetenv("INITIAL_ADMIN_PASSWORD")
	}()

	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 1 {
		t.Fatalf("Expected 1 admin, found %d", len(repo.admins))
	}

	// Verify that bcrypt compares successfully against the EXACT original password
	err := bcrypt.CompareHashAndPassword([]byte(repo.admins[0].PasswordHash), []byte(exactPassWithSpaces))
	if err != nil {
		t.Fatalf("Password verification failed! Leading/trailing spaces were not preserved: %v", err)
	}
}

func TestEnsureDefaultAdmin_RejectsWhitespaceOnlyPassword(t *testing.T) {
	repo := &mockAdminRepo{admins: []*models.Admin{}}
	cfg := &config.Config{
		ServerEnv: "production",
		JWTSecret: "test-secret-32-chars-long-minimum!",
	}

	// Whitespace-only password (>= 8 spaces)
	os.Setenv("INITIAL_ADMIN_EMAIL", "whitespace@aurabyhani.com")
	os.Setenv("INITIAL_ADMIN_PASSWORD", "        ")
	defer func() {
		os.Unsetenv("INITIAL_ADMIN_EMAIL")
		os.Unsetenv("INITIAL_ADMIN_PASSWORD")
	}()

	ensureDefaultAdmin(nil, repo, cfg)

	if len(repo.admins) != 0 {
		t.Fatalf("Whitespace-only password should be rejected, but an admin was seeded!")
	}
}
