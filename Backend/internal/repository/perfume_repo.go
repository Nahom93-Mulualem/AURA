package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"aura-backend/internal/models"
	"github.com/lib/pq"
)

type PerfumeRepository interface {
	GetAll(ctx context.Context, category string, status string, search string) ([]models.Perfume, error)
	GetBySlug(ctx context.Context, slug string) (*models.Perfume, error)
	GetByID(ctx context.Context, id string) (*models.Perfume, error)
	Create(ctx context.Context, p *models.Perfume) (*models.Perfume, error)
	UpdateStatus(ctx context.Context, id string, status models.PerfumeStatus) error
	Delete(ctx context.Context, id string) error
}

type postgresPerfumeRepo struct {
	db *sql.DB
}

func NewPerfumeRepository(db *sql.DB) PerfumeRepository {
	return &postgresPerfumeRepo{db: db}
}

// GetAll fetches all perfumes using safe parameterized SQL filters
func (r *postgresPerfumeRepo) GetAll(ctx context.Context, category string, status string, search string) ([]models.Perfume, error) {
	query := `
		SELECT id, name, slug, subtitle, tagline, description, price, size_ml, category, status,
		       featured, top_notes, heart_notes, base_notes, images, longevity, best_season, created_at, updated_at
		FROM perfumes
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if search != "" {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR subtitle ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}

	query += " ORDER BY featured DESC, created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query perfumes: %w", err)
	}
	defer rows.Close()

	var perfumes []models.Perfume
	for rows.Next() {
		var row models.PerfumeDBRow
		err := rows.Scan(
			&row.ID, &row.Name, &row.Slug, &row.Subtitle, &row.Tagline, &row.Description,
			&row.Price, &row.SizeMl, &row.Category, &row.Status, &row.Featured,
			&row.TopNotes, &row.HeartNotes, &row.BaseNotes, &row.Images,
			&row.Longevity, &row.BestSeason, &row.CreatedAt, &row.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan perfume row: %w", err)
		}
		perfumes = append(perfumes, row.ToPerfume())
	}

	return perfumes, nil
}

// GetBySlug retrieves a single perfume by its unique URL slug using parameterized SQL ($1)
func (r *postgresPerfumeRepo) GetBySlug(ctx context.Context, slug string) (*models.Perfume, error) {
	query := `
		SELECT id, name, slug, subtitle, tagline, description, price, size_ml, category, status,
		       featured, top_notes, heart_notes, base_notes, images, longevity, best_season, created_at, updated_at
		FROM perfumes
		WHERE slug = $1
	`
	var row models.PerfumeDBRow
	err := r.db.QueryRowContext(ctx, query, slug).Scan(
		&row.ID, &row.Name, &row.Slug, &row.Subtitle, &row.Tagline, &row.Description,
		&row.Price, &row.SizeMl, &row.Category, &row.Status, &row.Featured,
		&row.TopNotes, &row.HeartNotes, &row.BaseNotes, &row.Images,
		&row.Longevity, &row.BestSeason, &row.CreatedAt, &row.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to query perfume by slug: %w", err)
	}

	perfume := row.ToPerfume()
	return &perfume, nil
}

// GetByID retrieves a single perfume by its UUID using parameterized SQL ($1)
func (r *postgresPerfumeRepo) GetByID(ctx context.Context, id string) (*models.Perfume, error) {
	query := `
		SELECT id, name, slug, subtitle, tagline, description, price, size_ml, category, status,
		       featured, top_notes, heart_notes, base_notes, images, longevity, best_season, created_at, updated_at
		FROM perfumes
		WHERE id = $1
	`
	var row models.PerfumeDBRow
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&row.ID, &row.Name, &row.Slug, &row.Subtitle, &row.Tagline, &row.Description,
		&row.Price, &row.SizeMl, &row.Category, &row.Status, &row.Featured,
		&row.TopNotes, &row.HeartNotes, &row.BaseNotes, &row.Images,
		&row.Longevity, &row.BestSeason, &row.CreatedAt, &row.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query perfume by id: %w", err)
	}

	perfume := row.ToPerfume()
	return &perfume, nil
}

// Create inserts a new perfume record using parameterized SQL
func (r *postgresPerfumeRepo) Create(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	query := `
		INSERT INTO perfumes (
			name, slug, subtitle, tagline, description, price, size_ml,
			category, status, featured, top_notes, heart_notes, base_notes,
			images, longevity, best_season, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
		)
		RETURNING id, created_at, updated_at
	`
	now := time.Now()
	if p.Slug == "" {
		p.Slug = strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))
	}

	err := r.db.QueryRowContext(
		ctx,
		query,
		p.Name,
		p.Slug,
		p.Subtitle,
		p.Tagline,
		p.Description,
		p.Price,
		p.SizeMl,
		string(p.Category),
		string(p.Status),
		p.Featured,
		pq.StringArray(p.Notes.Top),
		pq.StringArray(p.Notes.Heart),
		pq.StringArray(p.Notes.Base),
		pq.StringArray(p.Images),
		p.Longevity,
		p.BestSeason,
		now,
		now,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to insert perfume: %w", err)
	}

	return p, nil
}

// UpdateStatus toggles perfume availability
func (r *postgresPerfumeRepo) UpdateStatus(ctx context.Context, id string, status models.PerfumeStatus) error {
	query := `UPDATE perfumes SET status = $1, updated_at = $2 WHERE id = $3`
	result, err := r.db.ExecContext(ctx, query, string(status), time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update perfume status: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		return fmt.Errorf("no perfume found with id: %s", id)
	}
	return nil
}

// Delete removes a perfume from inventory
func (r *postgresPerfumeRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM perfumes WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete perfume: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil || rows == 0 {
		return fmt.Errorf("no perfume found with id: %s", id)
	}
	return nil
}
