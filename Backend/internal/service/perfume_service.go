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
	ListPerfumes(ctx context.Context, category, status, search, fragranceType string) ([]models.Perfume, error)
	GetPerfume(ctx context.Context, slug string) (*models.Perfume, error)
	CreatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error)
	UpdatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error)
	PatchPerfume(ctx context.Context, id string, req *models.PatchPerfumeRequest) (*models.Perfume, error)
	DeletePerfume(ctx context.Context, id string) error
	ToggleStatus(ctx context.Context, id string) (models.PerfumeStatus, error)
	ValidateImageUpload(fileHeader *multipart.FileHeader, maxSizeMB int64) error
	NormalizeCategory(cat models.PerfumeCategory) (models.PerfumeCategory, error)
	ValidateFragranceType(ft string) (*models.FragranceType, error)
	ValidateShortDescription(sd string) (*string, error)
}

type perfumeService struct {
	repo repository.PerfumeRepository
}

func NewPerfumeService(repo repository.PerfumeRepository) PerfumeService {
	return &perfumeService{repo: repo}
}

// NormalizeCategory normalizes category inputs (feminine -> women, masculine -> men)
func (s *perfumeService) NormalizeCategory(cat models.PerfumeCategory) (models.PerfumeCategory, error) {
	lower := strings.ToLower(strings.TrimSpace(string(cat)))
	switch lower {
	case "women", "feminine":
		return models.CategoryWomen, nil
	case "men", "masculine":
		return models.CategoryMen, nil
	case "unisex", "":
		return models.CategoryUnisex, nil
	default:
		return "", fmt.Errorf("invalid category '%s'. Must be Women, Men, or Unisex", cat)
	}
}

// ValidateFragranceType validates optional fragrance type
func (s *perfumeService) ValidateFragranceType(ft string) (*models.FragranceType, error) {
	trimmed := strings.ToLower(strings.TrimSpace(ft))
	if trimmed == "" || trimmed == "none" {
		return nil, nil
	}
	switch models.FragranceType(trimmed) {
	case models.FragranceTypeEauDeParfum, models.FragranceTypeEauDeToilette,
		models.FragranceTypeExtraitDeParfum, models.FragranceTypePerfumeOil,
		models.FragranceTypeBakhoor, models.FragranceTypeBodySplash:
		val := models.FragranceType(trimmed)
		return &val, nil
	default:
		return nil, fmt.Errorf("invalid fragrance_type '%s'", ft)
	}
}

// ValidateShortDescription trims and validates that short description does not exceed 140 Unicode code points
func (s *perfumeService) ValidateShortDescription(sd string) (*string, error) {
	trimmed := strings.TrimSpace(sd)
	if trimmed == "" {
		return nil, nil
	}
	if len([]rune(trimmed)) > 140 {
		return nil, errors.New("short description cannot exceed 140 characters")
	}
	return &trimmed, nil
}

func (s *perfumeService) ListPerfumes(ctx context.Context, category, status, search, fragranceType string) ([]models.Perfume, error) {
	normCat := strings.ToLower(strings.TrimSpace(category))
	if normCat != "" && normCat != "all" {
		if _, err := s.NormalizeCategory(models.PerfumeCategory(normCat)); err != nil {
			return nil, err
		}
	}

	normType := strings.ToLower(strings.TrimSpace(fragranceType))
	if normType != "" && normType != "all" {
		if _, err := s.ValidateFragranceType(normType); err != nil {
			return nil, err
		}
	}

	return s.repo.GetAll(ctx, category, status, search, fragranceType)
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
	if p.Status == "" {
		p.Status = models.StatusAvailable
	}
	if p.SizeMl == "" {
		p.SizeMl = "100ml"
	}

	// 2. Normalize and validate category
	normalizedCat, err := s.NormalizeCategory(p.Category)
	if err != nil {
		return nil, err
	}
	p.Category = normalizedCat

	// 3. Validate fragrance type
	if p.FragranceType != nil {
		validatedType, err := s.ValidateFragranceType(string(*p.FragranceType))
		if err != nil {
			return nil, err
		}
		p.FragranceType = validatedType
	}

	// 4. Validate short description
	if p.ShortDescription != nil {
		validatedShort, err := s.ValidateShortDescription(*p.ShortDescription)
		if err != nil {
			return nil, err
		}
		p.ShortDescription = validatedShort
	}

	// 5. Delegate to repository
	return s.repo.Create(ctx, p)
}

// UpdatePerfume handles PUT /api/v1/perfumes/{id} - Full resource replacement
func (s *perfumeService) UpdatePerfume(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	if strings.TrimSpace(p.ID) == "" {
		return nil, errors.New("perfume id is required for update")
	}

	// 1. Check existing record
	existing, err := s.repo.GetByID(ctx, p.ID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("perfume not found with id: %s", p.ID)
	}

	// 2. Validate all mandatory fields for PUT full replacement
	if strings.TrimSpace(p.Name) == "" {
		return nil, errors.New("perfume name cannot be empty")
	}
	if strings.TrimSpace(p.Description) == "" {
		return nil, errors.New("perfume description cannot be empty")
	}
	if p.Price <= 0 {
		return nil, errors.New("price must be greater than 0 ETB")
	}
	if strings.TrimSpace(p.SizeMl) == "" {
		return nil, errors.New("size cannot be empty")
	}

	// 3. Normalize and validate category
	normalizedCat, err := s.NormalizeCategory(p.Category)
	if err != nil {
		return nil, err
	}
	p.Category = normalizedCat

	// 4. Validate status
	validStatus := false
	for _, st := range []models.PerfumeStatus{models.StatusAvailable, models.StatusSoldOut, models.StatusNew} {
		if p.Status == st {
			validStatus = true
			break
		}
	}
	if !validStatus {
		return nil, fmt.Errorf("invalid status '%s'. Must be available, sold_out, or new", p.Status)
	}

	// 5. Validate fragrance type
	if p.FragranceType != nil {
		validatedType, err := s.ValidateFragranceType(string(*p.FragranceType))
		if err != nil {
			return nil, err
		}
		p.FragranceType = validatedType
	}

	// 6. Validate short description
	if p.ShortDescription != nil {
		validatedShort, err := s.ValidateShortDescription(*p.ShortDescription)
		if err != nil {
			return nil, err
		}
		p.ShortDescription = validatedShort
	}

	// Update slug if empty or name changed
	if p.Slug == "" {
		p.Slug = strings.ToLower(strings.ReplaceAll(p.Name, " ", "-"))
	}
	p.CreatedAt = existing.CreatedAt

	return s.repo.Update(ctx, p)
}

// PatchPerfume handles PATCH /api/v1/perfumes/{id} - Partial updates with omitted fields left unchanged
func (s *perfumeService) PatchPerfume(ctx context.Context, id string, req *models.PatchPerfumeRequest) (*models.Perfume, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("perfume id is required for patch")
	}

	// 1. Fetch existing perfume from database
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, fmt.Errorf("perfume not found with id: %s", id)
	}

	// 2. Validate and apply only the non-nil provided fields
	if req.Name != nil {
		trimmedName := strings.TrimSpace(*req.Name)
		if trimmedName == "" {
			return nil, errors.New("perfume name cannot be empty")
		}
		existing.Name = trimmedName
		existing.Slug = strings.ToLower(strings.ReplaceAll(trimmedName, " ", "-"))
	}

	if req.Subtitle != nil {
		existing.Subtitle = strings.TrimSpace(*req.Subtitle)
	}

	if req.Tagline != nil {
		existing.Tagline = strings.TrimSpace(*req.Tagline)
	}

	if req.Description != nil {
		trimmedDesc := strings.TrimSpace(*req.Description)
		if trimmedDesc == "" {
			return nil, errors.New("perfume description cannot be empty")
		}
		existing.Description = trimmedDesc
	}

	if req.ShortDescription != nil {
		trimmedShort := strings.TrimSpace(*req.ShortDescription)
		if trimmedShort == "" {
			existing.ShortDescription = nil // Nullification
		} else {
			val, err := s.ValidateShortDescription(trimmedShort)
			if err != nil {
				return nil, err
			}
			existing.ShortDescription = val
		}
	}

	if req.Price != nil {
		if *req.Price <= 0 {
			return nil, errors.New("price must be greater than 0 ETB")
		}
		existing.Price = *req.Price
	}

	if req.SizeMl != nil {
		trimmedSize := strings.TrimSpace(*req.SizeMl)
		if trimmedSize == "" {
			return nil, errors.New("size cannot be empty")
		}
		existing.SizeMl = trimmedSize
	}

	if req.Category != nil {
		normCat, err := s.NormalizeCategory(*req.Category)
		if err != nil {
			return nil, err
		}
		existing.Category = normCat
	}

	if req.FragranceType != nil {
		trimmedType := strings.TrimSpace(*req.FragranceType)
		if trimmedType == "" {
			existing.FragranceType = nil // Nullification
		} else {
			val, err := s.ValidateFragranceType(trimmedType)
			if err != nil {
				return nil, err
			}
			existing.FragranceType = val
		}
	}

	if req.Status != nil {
		validStatus := false
		for _, st := range []models.PerfumeStatus{models.StatusAvailable, models.StatusSoldOut, models.StatusNew} {
			if *req.Status == st {
				validStatus = true
				break
			}
		}
		if !validStatus {
			return nil, fmt.Errorf("invalid status '%s'. Must be available, sold_out, or new", *req.Status)
		}
		existing.Status = *req.Status
	}

	if req.Featured != nil {
		existing.Featured = *req.Featured
	}

	if req.Notes != nil {
		existing.Notes = *req.Notes
	}

	if req.Images != nil {
		existing.Images = req.Images
	}

	if req.Longevity != nil {
		existing.Longevity = strings.TrimSpace(*req.Longevity)
	}

	if req.BestSeason != nil {
		existing.BestSeason = strings.TrimSpace(*req.BestSeason)
	}

	return s.repo.Update(ctx, existing)
}

func (s *perfumeService) DeletePerfume(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("perfume id cannot be empty")
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
	if strings.TrimSpace(id) == "" {
		return "", errors.New("perfume id cannot be empty")
	}
	perfume, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", err
	}
	if perfume == nil {
		return "", fmt.Errorf("perfume not found with id: %s", id)
	}

	newStatus := models.StatusAvailable
	if perfume.Status == models.StatusAvailable {
		newStatus = models.StatusSoldOut
	}

	if err := s.repo.UpdateStatus(ctx, id, newStatus); err != nil {
		return "", err
	}

	return newStatus, nil
}

func (s *perfumeService) ValidateImageUpload(fileHeader *multipart.FileHeader, maxSizeMB int64) error {
	if fileHeader == nil {
		return errors.New("no file provided")
	}
	if fileHeader.Size > maxSizeMB*1024*1024 {
		return fmt.Errorf("file size exceeds maximum allowed size of %dMB", maxSizeMB)
	}
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	validExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".avif": true,
	}
	if !validExtensions[ext] {
		return fmt.Errorf("invalid file format '%s'. Allowed formats: JPG, JPEG, PNG, WEBP, AVIF", ext)
	}
	return nil
}
