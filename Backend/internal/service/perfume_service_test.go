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

func (m *mockPerfumeRepo) Update(ctx context.Context, p *models.Perfume) (*models.Perfume, error) {
	for i, item := range m.perfumes {
		if item.ID == p.ID {
			m.perfumes[i] = *p
			return p, nil
		}
	}
	return nil, nil
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

func TestPerfumeService_UpdateValidation(t *testing.T) {
	initial := models.Perfume{
		ID:       "test-id-1",
		Name:     "Initial Name",
		Price:    5000,
		Category: models.CategoryUnisex,
		Status:   models.StatusAvailable,
	}
	repo := &mockPerfumeRepo{perfumes: []models.Perfume{initial}}
	svc := service.NewPerfumeService(repo)
	ctx := context.Background()

	// Test 1: Updating to invalid price
	_, err := svc.UpdatePerfume(ctx, &models.Perfume{
		ID:       "test-id-1",
		Name:     "Initial Name",
		Price:    -100,
		Category: models.CategoryUnisex,
	})
	if err == nil {
		t.Fatal("expected error for negative price on update, got nil")
	}

	// Test 2: Updating nonexistent ID
	_, err = svc.UpdatePerfume(ctx, &models.Perfume{
		ID:       "nonexistent-id",
		Name:     "Some Name",
		Price:    5500,
		Category: models.CategoryUnisex,
	})
	if err == nil {
		t.Fatal("expected error for nonexistent perfume, got nil")
	}

	// Test 3: Valid update
	updated, err := svc.UpdatePerfume(ctx, &models.Perfume{
		ID:          "test-id-1",
		Name:        "Updated Name",
		Description: "Updated description of exquisite fragrance",
		SizeMl:      "100ml",
		Price:       5500,
		Category:    models.CategoryUnisex,
		Status:      models.StatusAvailable,
	})
	if err != nil {
		t.Fatalf("unexpected error on valid update: %v", err)
	}
	if updated.Price != 5500 {
		t.Fatalf("expected updated price to be 5500, got %v", updated.Price)
	}
}

func TestPerfumeService_DeleteValidation(t *testing.T) {
	initial := models.Perfume{
		ID:    "del-id-1",
		Name:  "To Be Deleted",
		Price: 5000,
	}
	repo := &mockPerfumeRepo{perfumes: []models.Perfume{initial}}
	svc := service.NewPerfumeService(repo)
	ctx := context.Background()

	// Test 1: Empty ID
	if err := svc.DeletePerfume(ctx, ""); err == nil {
		t.Fatal("expected error for empty id on delete, got nil")
	}

	// Test 2: Nonexistent ID
	if err := svc.DeletePerfume(ctx, "wrong-id"); err == nil {
		t.Fatal("expected error for nonexistent id, got nil")
	}

	// Test 3: Valid delete
	if err := svc.DeletePerfume(ctx, "del-id-1"); err != nil {
		t.Fatalf("unexpected error deleting perfume: %v", err)
	}
}

func TestPerfumeService_PatchPerfume(t *testing.T) {
	initial := models.Perfume{
		ID:          "patch-id-1",
		Name:        "Saffron Glow",
		Slug:        "saffron-glow",
		Description: "A luxurious saffron scent",
		Price:       7000,
		SizeMl:      "100ml",
		Category:    models.CategoryUnisex,
		Status:      models.StatusAvailable,
		Notes: models.ScentNotes{
			Top:   []string{"Saffron"},
			Heart: []string{"Rose"},
			Base:  []string{"Amber"},
		},
	}
	repo := &mockPerfumeRepo{perfumes: []models.Perfume{initial}}
	svc := service.NewPerfumeService(repo)
	ctx := context.Background()

	// Test 1: Partial update - Price only
	newPrice := 8500.0
	patched, err := svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Price: &newPrice,
	})
	if err != nil {
		t.Fatalf("unexpected error on partial price patch: %v", err)
	}
	if patched.Price != 8500 {
		t.Fatalf("expected price 8500, got %v", patched.Price)
	}
	// Verify other fields remain intact
	if patched.Name != "Saffron Glow" || patched.Description != "A luxurious saffron scent" || len(patched.Notes.Top) != 1 {
		t.Fatalf("expected untouched fields to remain unchanged, got: %+v", patched)
	}

	// Test 2: Invalid price in PATCH (< 0) should be rejected
	invalidPrice := -50.0
	_, err = svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Price: &invalidPrice,
	})
	if err == nil {
		t.Fatal("expected error when patching negative price, got nil")
	}

	// Test 3: Invalid category in PATCH should be rejected
	invalidCategory := models.PerfumeCategory("invalid_category")
	_, err = svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Category: &invalidCategory,
	})
	if err == nil {
		t.Fatal("expected error when patching invalid category, got nil")
	}

	// Test 4: Patching Name updates Slug automatically
	newName := "Saffron Velvet"
	patchedName, err := svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Name: &newName,
	})
	if err != nil {
		t.Fatalf("unexpected error patching name: %v", err)
	}
	if patchedName.Name != "Saffron Velvet" || patchedName.Slug != "saffron-velvet" {
		t.Fatalf("expected name and slug updated, got name=%s slug=%s", patchedName.Name, patchedName.Slug)
	}
}
