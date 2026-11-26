package service_test

import (
	"context"
	"mime/multipart"
	"strings"
	"testing"

	"aura-backend/internal/models"
	"aura-backend/internal/service"
)

// MockPerfumeRepo for unit testing without database requirement
type mockPerfumeRepo struct {
	perfumes []models.Perfume
}

func (m *mockPerfumeRepo) GetAll(ctx context.Context, category, status, search, fragranceType string) ([]models.Perfume, error) {
	var result []models.Perfume
	for _, p := range m.perfumes {
		// Category match
		if category != "" && category != "all" {
			normCat := strings.ToLower(category)
			pCat := strings.ToLower(string(p.Category))
			if (normCat == "women" || normCat == "feminine") && pCat != "women" && pCat != "feminine" {
				continue
			}
			if (normCat == "men" || normCat == "masculine") && pCat != "men" && pCat != "masculine" {
				continue
			}
			if normCat == "unisex" && pCat != "unisex" {
				continue
			}
		}
		// Fragrance type match
		if fragranceType != "" && fragranceType != "all" {
			if p.FragranceType == nil || strings.ToLower(string(*p.FragranceType)) != strings.ToLower(fragranceType) {
				continue
			}
		}
		result = append(result, p)
	}
	return result, nil
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

	// Test 3: Legacy 'feminine' category is normalized to 'women'
	pFem, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:     "Rose Feminine",
		Price:    11000,
		Category: models.CategoryFeminine,
		Status:   models.StatusAvailable,
	})
	if err != nil {
		t.Fatalf("unexpected error creating perfume with feminine: %v", err)
	}
	if pFem.Category != models.CategoryWomen {
		t.Fatalf("expected category to normalize to 'women', got '%s'", pFem.Category)
	}

	// Test 4: Legacy 'masculine' category is normalized to 'men'
	pMasc, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:     "Wood Masculine",
		Price:    11000,
		Category: models.CategoryMasculine,
		Status:   models.StatusAvailable,
	})
	if err != nil {
		t.Fatalf("unexpected error creating perfume with masculine: %v", err)
	}
	if pMasc.Category != models.CategoryMen {
		t.Fatalf("expected category to normalize to 'men', got '%s'", pMasc.Category)
	}

	// Test 5: Valid fragrance type
	ft := models.FragranceTypeEauDeParfum
	pType, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:          "EDP Test",
		Price:         9000,
		Category:      models.CategoryUnisex,
		FragranceType: &ft,
	})
	if err != nil {
		t.Fatalf("unexpected error creating perfume with fragrance type: %v", err)
	}
	if pType.FragranceType == nil || *pType.FragranceType != models.FragranceTypeEauDeParfum {
		t.Fatalf("expected fragrance type 'eau_de_parfum', got '%v'", pType.FragranceType)
	}

	// Test 6: Invalid fragrance type is rejected
	badFt := models.FragranceType("invalid_type")
	_, err = svc.CreatePerfume(ctx, &models.Perfume{
		Name:          "Bad Type",
		Price:         9000,
		FragranceType: &badFt,
	})
	if err == nil {
		t.Fatal("expected error for invalid fragrance type, got nil")
	}

	// Test 7: Short description > 140 code points is rejected
	longDesc := strings.Repeat("A", 141)
	_, err = svc.CreatePerfume(ctx, &models.Perfume{
		Name:             "Too Long Short Desc",
		Price:            9000,
		ShortDescription: &longDesc,
	})
	if err == nil {
		t.Fatal("expected error for short description > 140 chars, got nil")
	}

	// Test 8: Short description <= 140 code points succeeds
	validDesc := "An enchanting blend of rare oud and velvet rose."
	pShort, err := svc.CreatePerfume(ctx, &models.Perfume{
		Name:             "Valid Short Desc",
		Price:            9000,
		ShortDescription: &validDesc,
	})
	if err != nil {
		t.Fatalf("unexpected error for valid short description: %v", err)
	}
	if pShort.ShortDescription == nil || *pShort.ShortDescription != validDesc {
		t.Fatalf("expected short description '%s', got '%v'", validDesc, pShort.ShortDescription)
	}
}

func TestPerfumeService_ListAndFilterEquivalence(t *testing.T) {
	edp := models.FragranceTypeEauDeParfum
	repo := &mockPerfumeRepo{
		perfumes: []models.Perfume{
			{ID: "1", Name: "Perfume Women 1", Category: models.CategoryWomen, FragranceType: &edp},
			{ID: "2", Name: "Perfume Fem Legacy", Category: models.CategoryFeminine, FragranceType: &edp},
			{ID: "3", Name: "Perfume Men 1", Category: models.CategoryMen},
			{ID: "4", Name: "Perfume Unisex 1", Category: models.CategoryUnisex},
		},
	}
	svc := service.NewPerfumeService(repo)
	ctx := context.Background()

	// 1. Querying with ?category=women and ?category=feminine returns identical results
	resWomen, err := svc.ListPerfumes(ctx, "women", "all", "", "all")
	if err != nil {
		t.Fatalf("unexpected error listing by women: %v", err)
	}
	resFem, err := svc.ListPerfumes(ctx, "feminine", "all", "", "all")
	if err != nil {
		t.Fatalf("unexpected error listing by feminine: %v", err)
	}
	if len(resWomen) != len(resFem) || len(resWomen) != 2 {
		t.Fatalf("expected 2 records for both women and feminine filters, got women=%d fem=%d", len(resWomen), len(resFem))
	}

	// 2. Querying by fragrance type
	resType, err := svc.ListPerfumes(ctx, "all", "all", "", "eau_de_parfum")
	if err != nil {
		t.Fatalf("unexpected error listing by fragrance type: %v", err)
	}
	if len(resType) != 2 {
		t.Fatalf("expected 2 records for eau_de_parfum, got %d", len(resType))
	}

	// 3. Invalid category returns error (HTTP 400 in handler)
	_, err = svc.ListPerfumes(ctx, "invalid_cat", "all", "", "all")
	if err == nil {
		t.Fatal("expected error for invalid category filter, got nil")
	}

	// 4. Invalid fragrance type returns error (HTTP 400 in handler)
	_, err = svc.ListPerfumes(ctx, "all", "all", "", "invalid_type")
	if err == nil {
		t.Fatal("expected error for invalid fragrance type filter, got nil")
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

	// Test 3: Valid update with new category 'women' and short description
	shortDesc := "Updated short description"
	updated, err := svc.UpdatePerfume(ctx, &models.Perfume{
		ID:               "test-id-1",
		Name:             "Updated Name",
		Description:      "Updated description of exquisite fragrance",
		ShortDescription: &shortDesc,
		SizeMl:           "100ml",
		Price:            5500,
		Category:         models.CategoryWomen,
		Status:           models.StatusAvailable,
	})
	if err != nil {
		t.Fatalf("unexpected error on valid update: %v", err)
	}
	if updated.Price != 5500 || updated.Category != models.CategoryWomen {
		t.Fatalf("expected updated price 5500 and category 'women', got price=%v cat=%s", updated.Price, updated.Category)
	}
}

func TestPerfumeService_PatchPerfume(t *testing.T) {
	origType := models.FragranceTypeEauDeParfum
	origShort := "Original short description"
	initial := models.Perfume{
		ID:               "patch-id-1",
		Name:             "Saffron Glow",
		Slug:             "saffron-glow",
		Description:      "A luxurious saffron scent",
		ShortDescription: &origShort,
		FragranceType:    &origType,
		Price:            7000,
		SizeMl:           "100ml",
		Category:         models.CategoryUnisex,
		Status:           models.StatusAvailable,
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

	// Test 2: Nullification of fragranceType and shortDescription
	emptyStr := ""
	patchedNull, err := svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		FragranceType:    &emptyStr,
		ShortDescription: &emptyStr,
	})
	if err != nil {
		t.Fatalf("unexpected error nullifying fields: %v", err)
	}
	if patchedNull.FragranceType != nil {
		t.Fatalf("expected fragranceType to be nil, got: %v", patchedNull.FragranceType)
	}
	if patchedNull.ShortDescription != nil {
		t.Fatalf("expected shortDescription to be nil, got: %v", patchedNull.ShortDescription)
	}
	// Verify untouched description remains intact
	if patchedNull.Description != "A luxurious saffron scent" {
		t.Fatalf("description was corrupted during nullification: %s", patchedNull.Description)
	}

	// Test 3: Invalid category in PATCH is rejected
	invalidCategory := models.PerfumeCategory("invalid_category")
	_, err = svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Category: &invalidCategory,
	})
	if err == nil {
		t.Fatal("expected error when patching invalid category, got nil")
	}

	// Test 4: Legacy 'feminine' in PATCH normalizes to 'women'
	femCat := models.PerfumeCategory("feminine")
	patchedCat, err := svc.PatchPerfume(ctx, "patch-id-1", &models.PatchPerfumeRequest{
		Category: &femCat,
	})
	if err != nil {
		t.Fatalf("unexpected error patching category: %v", err)
	}
	if patchedCat.Category != models.CategoryWomen {
		t.Fatalf("expected category 'women', got: %s", patchedCat.Category)
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
