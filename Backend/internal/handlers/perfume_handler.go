package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"aura-backend/internal/config"
	"aura-backend/internal/models"
	"aura-backend/internal/service"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/go-chi/chi/v5"
)

type PerfumeHandler struct {
	service service.PerfumeService
	cfg     *config.Config
	cld     *cloudinary.Cloudinary
}

func NewPerfumeHandler(service service.PerfumeService, cfg *config.Config, cld *cloudinary.Cloudinary) *PerfumeHandler {
	return &PerfumeHandler{
		service: service,
		cfg:     cfg,
		cld:     cld,
	}
}

// ListPerfumes handles GET /api/v1/perfumes
func (h *PerfumeHandler) ListPerfumes(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")

	perfumes, err := h.service.ListPerfumes(r.Context(), category, status, search)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to retrieve perfumes: "+err.Error())
		return
	}

	SendJSON(w, http.StatusOK, perfumes)
}

// GetPerfume handles GET /api/v1/perfumes/{slug}
func (h *PerfumeHandler) GetPerfume(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	perfume, err := h.service.GetPerfume(r.Context(), slug)
	if err != nil {
		SendError(w, http.StatusNotFound, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, perfume)
}

// CreatePerfume handles POST /api/v1/perfumes (Admin protected)
func (h *PerfumeHandler) CreatePerfume(w http.ResponseWriter, r *http.Request) {
	var input models.Perfume
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
		return
	}

	created, err := h.service.CreatePerfume(r.Context(), &input)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusCreated, created)
}

// UpdatePerfume handles PUT /api/v1/perfumes/{id} (Admin protected)
func (h *PerfumeHandler) UpdatePerfume(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		SendError(w, http.StatusBadRequest, "Missing perfume ID in URL path")
		return
	}

	var input models.Perfume
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
		return
	}
	input.ID = id

	updated, err := h.service.UpdatePerfume(r.Context(), &input)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, updated)
}

// PatchPerfume handles PATCH /api/v1/perfumes/{id} (Admin protected) - Partial resource updates
func (h *PerfumeHandler) PatchPerfume(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		SendError(w, http.StatusBadRequest, "Missing perfume ID in URL path")
		return
	}

	var input models.PatchPerfumeRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
		return
	}

	updated, err := h.service.PatchPerfume(r.Context(), id, &input)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, updated)
}

// DeletePerfume handles DELETE /api/v1/perfumes/{id} (Admin protected)
func (h *PerfumeHandler) DeletePerfume(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		SendError(w, http.StatusBadRequest, "Missing perfume ID in URL path")
		return
	}

	if err := h.service.DeletePerfume(r.Context(), id); err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, map[string]string{
		"message": "Perfume successfully deleted",
		"id":      id,
	})
}

// ToggleStatus handles PATCH /api/v1/perfumes/{id}/status (Admin protected)
func (h *PerfumeHandler) ToggleStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	newStatus, err := h.service.ToggleStatus(r.Context(), id)
	if err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	SendJSON(w, http.StatusOK, map[string]string{
		"id":     id,
		"status": string(newStatus),
	})
}

// UploadImage handles POST /api/v1/admin/upload (Admin protected)
func (h *PerfumeHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	// Parse multi-part form up to max upload size
	maxBytes := h.cfg.MaxUploadSizeMB * 1024 * 1024
	r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	if err := r.ParseMultipartForm(maxBytes); err != nil {
		SendError(w, http.StatusBadRequest, "File exceeds size limit")
		return
	}

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		SendError(w, http.StatusBadRequest, "Missing image field in upload form")
		return
	}
	defer file.Close()

	// Validate type and size per AGENTS.md rules
	if err := h.service.ValidateImageUpload(fileHeader, h.cfg.MaxUploadSizeMB); err != nil {
		SendError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Ensure upload directory exists
	if err := os.MkdirAll(h.cfg.UploadDir, os.ModePerm); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	// Create unique filename
	ext := filepath.Ext(fileHeader.Filename)
	uniqueFilename := fmt.Sprintf("aura-%d%s", time.Now().UnixNano(), ext)
	dstPath := filepath.Join(h.cfg.UploadDir, uniqueFilename)

	dst, err := os.Create(dstPath)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to save file to disk")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to write file contents")
		return
	}

	// Return image URL
	imageURL := fmt.Sprintf("http://localhost:%s/uploads/%s", h.cfg.ServerPort, uniqueFilename)
	SendJSON(w, http.StatusOK, map[string]string{
		"url":      imageURL,
		"filename": uniqueFilename,
	})
}
