package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort       string
	ServerEnv        string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	DBSSLMode        string
	JWTSecret        string
	UploadDir        string
	MaxUploadSizeMB  int64
	CookieDomain     string
	CookieSecure     bool
	AllowedOrigins   []string
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

	return &Config{
		ServerPort:      getEnv("SERVER_PORT", "8080"),
		ServerEnv:       serverEnv,
		DBHost:          getEnv("DB_HOST", "localhost"),
		DBPort:          getEnv("DB_PORT", "5432"),
		DBUser:          getEnv("DB_USER", "postgres"),
		DBPassword:      getEnv("DB_PASSWORD", "postgres"),
		DBName:          getEnv("DB_NAME", "aura_db"),
		DBSSLMode:       getEnv("DB_SSLMODE", "disable"),
		JWTSecret:       getEnv("JWT_SECRET", "super_secret_aura_jwt_key_hani_2026"),
		UploadDir:       getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadSizeMB: maxSize,
		CookieDomain:    getEnv("COOKIE_DOMAIN", ""),
		CookieSecure:    cookieSecure,
		AllowedOrigins:  allowedOrigins,
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}
