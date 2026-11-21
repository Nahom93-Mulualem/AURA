package service_test

import (
	"context"
	"mime/multipart"
	"testing"

	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

// MockPerfumeRepo for unit testing without database requirement
type mockPerfumeRepo struct {
	perfumes []models.Perfume
}

func (m *mockPerfumeRepo) GetAll(ctx context.Context, category, status, search string) ([]models.Perfume, error) {
	return m.perfumes, nil
}

func (m *mockPerfumeRepo) GetBySlug(ctx context.Context, slug string) (*models.Perfume, error) {
	for _, p := range m.perfumes {
		if p.Slug == slug {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPerfumeRepo) GetByID(ctx context.Context, id string) (*models.Perfume, error) {
	for _, p := range m.perfumes {
		if p.ID == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPerfumeRepo) Create(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	p.ID = "mock-id-123"
	m.perfumes = append(m.perfumes, *p)
	return p, nil
}

func (m *mockPerfumeRepo) UpdateStatus(ctx context.Context, id string, status models.PerfumeStatus) error {
	for i, p := range m.perfumes {
		if p.ID == id {
			m.perfumes[i].Status = status
			return nil
		}
	}
	return nil
}

func (m *mockPerfumeRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func TestPerfumeService_CreateValidation(t *testing.T) {
	repo := &mockPerfumeRepo{}
	svc := service.NewPerfumeService(repo)
	ctx := context.Background()

	// Test 1: Empty name should fail
	_, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:  "",
		Price: 12500,
	})
	if err == nil {
		t.Fatal("expected error for empty name, got nil")
	}

	// Test 2: Negative or zero price should fail
	_, err = svc.CreatePerfume(ctx, &models.Perfume{
		Name:  "Amber Dusk",
		Price: -10,
	})
	if err == nil {
		t.Fatal("expected error for negative price, got nil")
	}

	// Test 3: Valid perfume should succeed
	created, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:     "Amber Dusk",
		Price:    11000,
		Category: models.CategoryUnisex,
		Status:   models.StatusAvailable,
	})
	if err != nil {
		t.Fatalf("unexpected error creating perfume: %v", err)
	}
	if created.ID == "" {
		t.Fatal("expected created perfume to have an ID")
	}
}

func TestPerfumeService_ValidateImageUpload(t *testing.T) {
	repo := &mockPerfumeRepo{}
	svc := service.NewPerfumeService(repo)

	// Test 1: Exceeding max size
	largeHeader := &multipart.FileHeader{
		Filename: "bottle.png",
		Size:     6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
	}
	if err := svc.ValidateImageUpload(largeHeader, 5); err == nil {
		t.Fatal("expected error for file exceeding 5MB, got nil")
	}

	// Test 2: Disallowed file extension (.exe)
	disallowedHeader := &multipart.FileHeader{
		Filename: "malicious.exe",
		Size:     1024,
	}
	if err := svc.ValidateImageUpload(disallowedHeader, 5); err == nil {
		t.Fatal("expected error for .exe extension, got nil")
	}

	// Test 3: Valid WebP image
	validHeader := &multipart.FileHeader{
		Filename: "perfume-oud.webp",
		Size:     2 * 1024 * 1024, // 2MB
	}
	if err := svc.ValidateImageUpload(validHeader, 5); err != nil {
		t.Fatalf("unexpected error for valid webp image: %v", err)
	}
}
