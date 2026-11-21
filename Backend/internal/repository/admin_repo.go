package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"aura-backend/internal/models"
)

type AdminRepository interface {
	GetByEmail(ctx context.Context, email string) (*models.Admin, error)
	Create(ctx context.Context, email, passwordHash string) (*models.Admin, error)
}

type postgresAdminRepo struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) AdminRepository {
	return &postgresAdminRepo{db: db}
}

// GetByEmail retrieves an admin user by email using parameterized SQL ($1)
func (r *postgresAdminRepo) GetByEmail(ctx context.Context, email string) (*models.Admin, error) {
	query := `
		SELECT id, email, password_hash, created_at, updated_at
		FROM admins
		WHERE email = $1
	`
	var admin models.Admin
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&admin.ID, &admin.Email, &admin.PasswordHash, &admin.CreatedAt, &admin.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Admin not found
		}
		return nil, fmt.Errorf("failed to query admin by email: %w", err)
	}

	return &admin, nil
}

// Create inserts a new admin user record with a bcrypt hashed password
func (r *postgresAdminRepo) Create(ctx context.Context, email, passwordHash string) (*models.Admin, error) {
	query := `
		INSERT INTO admins (email, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	now := time.Now()
	var admin models.Admin
	admin.Email = email
	admin.PasswordHash = passwordHash

	err := r.db.QueryRowContext(ctx, query, email, passwordHash, now, now).Scan(
		&admin.ID, &admin.CreatedAt, &admin.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create admin: %w", err)
	}

	return &admin, nil
}
