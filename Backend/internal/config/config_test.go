package config

import (
	"os"
	"testing"
)

func TestResolvePort(t *testing.T) {
	// 1. Both unset -> defaults to 8080
	os.Unsetenv("PORT")
	os.Unsetenv("SERVER_PORT")
	if p := resolvePort(); p != "8080" {
		t.Errorf("Expected 8080, got %s", p)
	}

	// 2. SERVER_PORT set -> uses SERVER_PORT
	os.Setenv("SERVER_PORT", "9000")
	if p := resolvePort(); p != "9000" {
		t.Errorf("Expected 9000, got %s", p)
	}

	// 3. PORT set (e.g. Render) -> PORT takes precedence over SERVER_PORT
	os.Setenv("PORT", "10000")
	if p := resolvePort(); p != "10000" {
		t.Errorf("Expected 10000, got %s", p)
	}

	// Clean up
	os.Unsetenv("PORT")
	os.Unsetenv("SERVER_PORT")
}

func TestValidateJWTSecret_Production(t *testing.T) {
	// 1. Missing in production
	_, err := validateJWTSecret("production", "", false)
	if err == nil {
		t.Error("Expected error when JWT_SECRET is missing in production")
	}

	// 2. Empty string in production
	_, err = validateJWTSecret("production", "   ", true)
	if err == nil {
		t.Error("Expected error when JWT_SECRET is blank in production")
	}

	// 3. Default fallback in production
	_, err = validateJWTSecret("production", "super_secret_aura_jwt_key_hani_2026", true)
	if err == nil {
		t.Error("Expected error when using default fallback JWT_SECRET in production")
	}

	// 4. Shorter than 32 characters in production
	_, err = validateJWTSecret("production", "short_secret_under_32_chars", true)
	if err == nil {
		t.Error("Expected error when JWT_SECRET is < 32 characters in production")
	}

	// 5. Valid 32+ character key in production
	validKey := "secure_random_production_jwt_key_32chars!"
	secret, err := validateJWTSecret("production", validKey, true)
	if err != nil {
		t.Errorf("Expected success for valid production key, got error: %v", err)
	}
	if secret != validKey {
		t.Errorf("Expected %s, got %s", validKey, secret)
	}
}

func TestValidateJWTSecret_Development(t *testing.T) {
	// Missing in development -> returns safe default fallback
	secret, err := validateJWTSecret("development", "", false)
	if err != nil {
		t.Errorf("Expected no error in development for missing secret, got: %v", err)
	}
	if secret != "super_secret_aura_jwt_key_hani_2026" {
		t.Errorf("Expected fallback in development, got: %s", secret)
	}

	// Custom secret in development -> uses custom secret
	custom := "my_local_dev_key"
	secret, err = validateJWTSecret("development", custom, true)
	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if secret != custom {
		t.Errorf("Expected %s, got %s", custom, secret)
	}
}
