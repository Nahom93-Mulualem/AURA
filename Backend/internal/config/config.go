package config

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort          string
	ServerEnv           string
	DatabaseURL         string
	DBHost              string
	DBPort              string
	DBUser              string
	DBPassword          string
	DBName              string
	DBSSLMode           string
	JWTSecret           string
	UploadDir           string
	MaxUploadSizeMB     int64
	CookieDomain        string
	CookieSecure        bool
	AllowedOrigins      []string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
}

func LoadConfig() *Config {
	// Load .env file if it exists, otherwise fall back to environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, reading from system environment variables")
	}

	maxSize, err := strconv.ParseInt(getEnv("MAX_UPLOAD_SIZE_MB", "5"), 10, 64)
	if err != nil {
		maxSize = 5
	}

	serverEnv := getEnv("SERVER_ENV", "development")
	cookieSecureStr := getEnv("COOKIE_SECURE", "")
	cookieSecure := false
	if cookieSecureStr == "true" || (cookieSecureStr == "" && serverEnv == "production") {
		cookieSecure = true
	}

	originsRaw := getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
	var allowedOrigins []string
	for _, o := range strings.Split(originsRaw, ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			allowedOrigins = append(allowedOrigins, trimmed)
		}
	}
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}

	port := resolvePort()

	rawSecret, secretExists := os.LookupEnv("JWT_SECRET")
	jwtSecret, err := validateJWTSecret(serverEnv, rawSecret, secretExists)
	if err != nil {
		log.Fatalf("%v", err)
	}

	return &Config{
		ServerPort:          port,
		ServerEnv:           serverEnv,
		DatabaseURL:         getEnv("DATABASE_URL", ""),
		DBHost:              getEnv("DB_HOST", "localhost"),
		DBPort:              getEnv("DB_PORT", "5432"),
		DBUser:              getEnv("DB_USER", "postgres"),
		DBPassword:          getEnv("DB_PASSWORD", "postgres"),
		DBName:              getEnv("DB_NAME", "aura_db"),
		DBSSLMode:           getEnv("DB_SSLMODE", "disable"),
		JWTSecret:           jwtSecret,
		UploadDir:           getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadSizeMB:     maxSize,
		CookieDomain:        getEnv("COOKIE_DOMAIN", ""),
		CookieSecure:        cookieSecure,
		AllowedOrigins:      allowedOrigins,
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

func resolvePort() string {
	if port := getEnv("PORT", ""); port != "" {
		return port
	}
	return getEnv("SERVER_PORT", "8080")
}

func validateJWTSecret(serverEnv string, rawSecret string, exists bool) (string, error) {
	if serverEnv != "production" {
		if exists && rawSecret != "" {
			return rawSecret, nil
		}
		return "super_secret_aura_jwt_key_hani_2026", nil
	}

	if !exists || strings.TrimSpace(rawSecret) == "" {
		return "", errors.New("Fatal [CRITICAL SECURITY]: JWT_SECRET must be explicitly provided in production.")
	}
	if rawSecret == "super_secret_aura_jwt_key_hani_2026" {
		return "", errors.New("Fatal [CRITICAL SECURITY]: Default fallback JWT_SECRET cannot be used in production. Set a secure random 32+ character key.")
	}
	if len(rawSecret) < 32 {
		return "", fmt.Errorf("Fatal [CRITICAL SECURITY]: JWT_SECRET in production must be at least 32 characters long (provided: %d characters).", len(rawSecret))
	}
	return rawSecret, nil
}
