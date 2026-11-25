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
	GetByID(ctx context.Context, id string) (*models.Admin, error)
	Create(ctx context.Context, email, passwordHash string) (*models.Admin, error)
	UpdatePassword(ctx context.Context, id string, passwordHash string) error
	UpdateEmail(ctx context.Context, id string, email string) error
	Count(ctx context.Context) (int, error)
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

// GetByID retrieves an admin user by UUID using parameterized SQL ($1)
func (r *postgresAdminRepo) GetByID(ctx context.Context, id string) (*models.Admin, error) {
	query := `
		SELECT id, email, password_hash, created_at, updated_at
		FROM admins
		WHERE id = $1
	`
	var admin models.Admin
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&admin.ID, &admin.Email, &admin.PasswordHash, &admin.CreatedAt, &admin.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Admin not found
		}
		return nil, fmt.Errorf("failed to query admin by id: %w", err)
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

// UpdatePassword updates an admin's bcrypt password hash using parameterized SQL
func (r *postgresAdminRepo) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
	query := `
		UPDATE admins
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`
	res, err := r.db.ExecContext(ctx, query, passwordHash, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update admin password: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no admin found with id: %s", id)
	}
	return nil
}

// UpdateEmail updates an admin's email address using parameterized SQL
func (r *postgresAdminRepo) UpdateEmail(ctx context.Context, id string, email string) error {
	query := `
		UPDATE admins
		SET email = $1, updated_at = $2
		WHERE id = $3
	`
	res, err := r.db.ExecContext(ctx, query, email, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update admin email: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no admin found with id: %s", id)
	}
	return nil
}

// Count returns the total number of admin accounts in PostgreSQL
func (r *postgresAdminRepo) Count(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM admins").Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count admin accounts: %w", err)
	}
	return count, nil
}
