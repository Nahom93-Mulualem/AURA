package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"aura-backend/internal/config"
	_ "github.com/lib/pq"
)

func ConnectPostgres(cfg *config.Config) (*sql.DB, error) {
	connStr := cfg.DatabaseURL
	if connStr == "" {
		connStr = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
		)
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure healthy connection pooling
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(15 * time.Minute)

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Printf("Warning: PostgreSQL not currently reachable at %s:%s (%v). Running with mock/fallback mode until database is launched.\n", cfg.DBHost, cfg.DBPort, err)
		return db, err
	}

	log.Println("✓ Successfully connected to PostgreSQL database:", cfg.DBName)
	return db, nil
}
