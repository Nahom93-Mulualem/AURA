package service

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"aura-backend/internal/models"
	"aura-backend/internal/repository"
)

type PerfumeService interface {
	ListPerfumes(ctx context.Context, category, status, search string) ([]models.Perfume, error)
	GetPerfume(ctx context.Context, slug string) (*models.Perfume, error)
	CreatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error)
	UpdatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error)
	DeletePerfume(ctx context.Context, id string) error
	ToggleStatus(ctx context.Context, id string) (models.PerfumeStatus, error)
	ValidateImageUpload(fileHeader *multipart.FileHeader, maxSizeMB int64) error
}

type perfumeService struct {
	repo repository.PerfumeRepository
}

func NewPerfumeService(repo repository.PerfumeRepository) PerfumeService {
	return &perfumeService{repo: repo}
}

func (s *perfumeService) ListPerfumes(ctx context.Context, category, status, search string) ([]models.Perfume, error) {
	return s.repo.GetAll(ctx, category, status, search)
}

func (s *perfumeService) GetPerfume(ctx context.Context, slug string) (*models.Perfume, error) {
	if strings.TrimSpace(slug) == "" {
		return nil, errors.New("slug cannot be empty")
	}
	perfume, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if perfume == nil {
		return nil, errors.New("perfume not found")
	}
	return perfume, nil
}

func (s *perfumeService) CreatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	// 1. Validate mandatory fields
	if strings.TrimSpace(p.Name) == "" {
		return nil, errors.New("perfume name is required")
	}
	if p.Price <= 0 {
		return nil, errors.New("price must be greater than 0 ETB")
	}
	if p.Category == "" {
		p.Category = models.CategoryUnisex
	}
	if p.Status == "" {
		p.Status = models.StatusAvailable
	}
	if p.SizeMl == "" {
		p.SizeMl = "100ml"
	}

	// 2. Validate category
	validCategory := false
	for _, c := range []models.PerfumeCategory{models.CategoryUnisex, models.CategoryFeminine, models.CategoryMasculine} {
		if p.Category == c {
			validCategory = true
			break
		}
	}
	if !validCategory {
		return nil, fmt.Errorf("invalid category: %s", p.Category)
	}

	// 3. Delegate to repository
	return s.repo.Create(ctx, p)
}

func (s *perfumeService) UpdatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	if strings.TrimSpace(p.ID) == "" {
		return nil, errors.New("perfume id is required for update")
	}

	// 1. Check existing
	existing, err := s.repo.GetByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("perfume not found with id: %s", p.ID)
	}

	// 2. Validate mandatory fields
	if strings.TrimSpace(p.Name) == "" {
		return nil, errors.New("perfume name cannot be empty")
	}
	if p.Price <= 0 {
		return nil, errors.New("price must be greater than 0 ETB")
	}
	if p.Category == "" {
		p.Category = existing.Category
	}
	if p.Status == "" {
		p.Status = existing.Status
	}
	if p.SizeMl == "" {
		p.SizeMl = existing.SizeMl
	}
	if p.Slug == "" {
		p.Slug = strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))
	}
	p.CreatedAt = existing.CreatedAt

	// 3. Validate category
	validCategory := false
	for _, c := range []models.PerfumeCategory{models.CategoryUnisex, models.CategoryFeminine, models.CategoryMasculine} {
		if p.Category == c {
			validCategory = true
			break
		}
	}
	if !validCategory {
		return nil, fmt.Errorf("invalid category: %s", p.Category)
	}

	return s.repo.Update(ctx, p)
}

func (s *perfumeService) DeletePerfume(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("perfume id is required for delete")
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("perfume not found with id: %s", id)
	}

	return s.repo.Delete(ctx, id)
}

func (s *perfumeService) ToggleStatus(ctx context.Context, id string) (models.PerfumeStatus, error) {
	perfume, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", err
	}
	if perfume == nil {
		return "", errors.New("perfume not found")
	}

	newStatus := models.StatusAvailable
	if perfume.Status == models.StatusAvailable || perfume.Status == models.StatusNew {
		newStatus = models.StatusSoldOut
	}

	if err := s.repo.UpdateStatus(ctx, id, newStatus); err != nil {
		return "", err
	}
	return newStatus, nil
}

// ValidateImageUpload validates file extension, MIME type, and size (satisfies AGENTS.md rule)
func (s *perfumeService) ValidateImageUpload(fileHeader *multipart.FileHeader, maxSizeMB int64) error {
	// 1. Validate file size
	maxBytes := maxSizeMB * 1024 * 1024
	if fileHeader.Size > maxBytes {
		return fmt.Errorf("file size (%d MB) exceeds maximum allowed limit of %d MB", fileHeader.Size/(1024*1024), maxSizeMB)
	}

	// 2. Validate file extension
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".avif": true,
	}

	if !allowedExtensions[ext] {
		return fmt.Errorf("unsupported image format '%s'. Allowed formats: webp, jpg, png, avif", ext)
	}

	return nil
}
