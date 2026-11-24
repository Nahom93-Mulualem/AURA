package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"aura-backend/internal/config"
	"aura-backend/internal/database"
	"aura-backend/internal/handlers"
	"aura-backend/internal/middleware"
	"aura-backend/internal/repository"
	"aura-backend/internal/service"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	// 1. Load Configurations
	cfg := config.LoadConfig()
	log.Printf("Starting Aura by HANI Backend (Environment: %s)\n", cfg.ServerEnv)

	// 2. Connect to PostgreSQL
	db, err := database.ConnectPostgres(cfg)
	if err != nil {
		log.Println("Database notice:", err)
	}
	defer func() {
		if db != nil {
			_ = db.Close()
		}
	}()

	// 3. Initialize Layered Architecture (repository -> service -> handlers)
	var adminRepo repository.AdminRepository
	var perfumeRepo repository.PerfumeRepository

	if db != nil {
		adminRepo = repository.NewAdminRepository(db)
		perfumeRepo = repository.NewPerfumeRepository(db)
		ensureDefaultAdmin(db, adminRepo, cfg)
	}

	authService := service.NewAuthService(adminRepo, cfg.JWTSecret)
	perfumeService := service.NewPerfumeService(perfumeRepo)

	authHandler := handlers.NewAuthHandler(authService, cfg)
	perfumeHandler := handlers.NewPerfumeHandler(perfumeService, cfg)

	// 4. Configure Chi Router and Middlewares
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.CorsMiddleware(cfg.AllowedOrigins))

	// 5. Static uploads file server
	if err := os.MkdirAll(cfg.UploadDir, os.ModePerm); err == nil {
		fileServer := http.FileServer(http.Dir(cfg.UploadDir))
		r.Handle("/uploads/*", http.StripPrefix("/uploads", fileServer))
	}

	// 6. Register API Endpoints
	r.Route("/api/v1", func(r chi.Router) {
		// Health check
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			handlers.SendJSON(w, http.StatusOK, map[string]string{
				"status":  "healthy",
				"service": "Aura by HANI API",
			})
		})

		// Public Perfume Routes
		r.Get("/perfumes", perfumeHandler.ListPerfumes)
		r.Get("/perfumes/{slug}", perfumeHandler.GetPerfume)

		// Admin Authentication
		r.Post("/admin/login", authHandler.Login)
		r.Post("/admin/logout", authHandler.Logout)

		// Protected Admin Routes (Requires valid JWT Bearer Token or Session Cookie)
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(authService, cfg.AllowedOrigins))

			r.Get("/admin/me", authHandler.Me)
			r.Post("/perfumes", perfumeHandler.CreatePerfume)
			r.Put("/perfumes/{id}", perfumeHandler.UpdatePerfume)
			r.Delete("/perfumes/{id}", perfumeHandler.DeletePerfume)
			r.Patch("/perfumes/{id}/status", perfumeHandler.ToggleStatus)
			r.Post("/admin/upload", perfumeHandler.UploadImage)
		})
	})

	// 7. Start HTTP Server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("✓ Aura by HANI API listening on http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, r); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}

// ensureDefaultAdmin seeds a default admin account if not already present
func ensureDefaultAdmin(db *sql.DB, adminRepo repository.AdminRepository, cfg *config.Config) {
	ctx := context.Background()
	admin, err := adminRepo.GetByEmail(ctx, "admin@aurabyhani.com")
	if err == nil && admin == nil {
		authSvc := service.NewAuthService(adminRepo, cfg.JWTSecret)
		_, _ = authSvc.RegisterAdmin(ctx, "admin@aurabyhani.com", "AuraLuxury2026!")
		log.Println("✓ Seeded default admin: admin@aurabyhani.com")
	}
}
