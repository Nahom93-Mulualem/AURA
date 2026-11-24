package models

import (
	"time"

	"github.com/lib/pq"
)

type PerfumeStatus string
const (
	StatusAvailable PerfumeStatus = "available"
	StatusSoldOut   PerfumeStatus = "sold_out"
	StatusNew       PerfumeStatus = "new"
)

type PerfumeCategory string
const (
	CategoryUnisex    PerfumeCategory = "unisex"
	CategoryFeminine  PerfumeCategory = "feminine"
	CategoryMasculine PerfumeCategory = "masculine"
)

type ScentNotes struct {
	Top   []string `json:"top"`
	Heart []string `json:"heart"`
	Base  []string `json:"base"`
}

type Perfume struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Slug        string          `json:"slug"`
	Subtitle    string          `json:"subtitle"`
	Tagline     string          `json:"tagline"`
	Description string          `json:"description"`
	Price       float64         `json:"price"` // in Ethiopian Birr (ETB)
	SizeMl      string          `json:"sizeMl"`
	Category    PerfumeCategory `json:"category"`
	Status      PerfumeStatus   `json:"status"`
	Featured    bool            `json:"featured"`
	Notes       ScentNotes      `json:"notes"`
	Images      []string        `json:"images"`
	Longevity   string          `json:"longevity,omitempty"`
	BestSeason  string          `json:"bestSeason,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// PatchPerfumeRequest defines optional fields for PATCH /api/v1/perfumes/{id}
type PatchPerfumeRequest struct {
	Name        *string          `json:"name,omitempty"`
	Subtitle    *string          `json:"subtitle,omitempty"`
	Tagline     *string          `json:"tagline,omitempty"`
	Description *string          `json:"description,omitempty"`
	Price       *float64         `json:"price,omitempty"`
	SizeMl      *string          `json:"sizeMl,omitempty"`
	Category    *PerfumeCategory `json:"category,omitempty"`
	Status      *PerfumeStatus   `json:"status,omitempty"`
	Featured    *bool            `json:"featured,omitempty"`
	Notes       *ScentNotes      `json:"notes,omitempty"`
	Images      []string         `json:"images,omitempty"`
	Longevity   *string          `json:"longevity,omitempty"`
	BestSeason  *string          `json:"bestSeason,omitempty"`
}

// SQL scan helper
type PerfumeDBRow struct {
	ID          string
	Name        string
	Slug        string
	Subtitle    string
	Tagline     string
	Description string
	Price       float64
	SizeMl      string
	Category    string
	Status      string
	Featured    bool
	TopNotes    pq.StringArray
	HeartNotes  pq.StringArray
	BaseNotes   pq.StringArray
	Images      pq.StringArray
	Longevity   string
	BestSeason  string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (row *PerfumeDBRow) ToPerfume() Perfume {
	return Perfume{
		ID:          row.ID,
		Name:        row.Name,
		Slug:        row.Slug,
		Subtitle:    row.Subtitle,
		Tagline:     row.Tagline,
		Description: row.Description,
		Price:       row.Price,
		SizeMl:      row.SizeMl,
		Category:    PerfumeCategory(row.Category),
		Status:      PerfumeStatus(row.Status),
		Featured:    row.Featured,
		Notes: ScentNotes{
			Top:   []string(row.TopNotes),
			Heart: []string(row.HeartNotes),
			Base:  []string(row.BaseNotes),
		},
		Images:     []string(row.Images),
		Longevity:  row.Longevity,
		BestSeason: row.BestSeason,
		CreatedAt:  row.CreatedAt,
		UpdatedAt:  row.UpdatedAt,
	}
}
