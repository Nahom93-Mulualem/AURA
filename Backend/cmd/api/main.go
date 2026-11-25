package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"aura-backend/internal/config"
	"aura-backend/internal/database"
	"aura-backend/internal/handlers"
	"aura-backend/internal/middleware"
	"aura-backend/internal/repository"
	"aura-backend/internal/service"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func initCloudinary(cfg *config.Config) (*cloudinary.Cloudinary, error) {
	if cfg.CloudinaryCloudName == "" || cfg.CloudinaryAPIKey == "" || cfg.CloudinaryAPISecret == "" {
		return nil, fmt.Errorf("missing required Cloudinary credentials (cloud name, API key, and API secret must be set)")
	}

	cld, err := cloudinary.NewFromParams(
		cfg.CloudinaryCloudName,
		cfg.CloudinaryAPIKey,
		cfg.CloudinaryAPISecret,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Cloudinary client: %w", err)
	}

	return cld, nil
}

func main() {
	// 1. Load Configurations
	cfg := config.LoadConfig()
	log.Printf("Starting Aura by HANI Backend (Environment: %s)\n", cfg.ServerEnv)

	// 2. Connect to PostgreSQL
	db, err := database.ConnectPostgres(cfg)
	if err != nil {
		if cfg.ServerEnv == "production" {
			log.Fatalf("Fatal [CRITICAL SECURITY]: Failed to connect to PostgreSQL database in production: %v\n", err)
		}
		log.Println("Database notice (offline/development mode):", err)
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

	// 4. Initialize Cloudinary Client (Single instance)
	cld, err := initCloudinary(cfg)
	if err != nil {
		log.Fatalf("Cloudinary startup error: %v\n", err)
	}

	authHandler := handlers.NewAuthHandler(authService, cfg)
	perfumeHandler := handlers.NewPerfumeHandler(perfumeService, cfg, cld)

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
			r.Post("/admin/change-password", authHandler.ChangePassword)
			r.Put("/admin/profile", authHandler.UpdateProfile)
			r.Post("/perfumes", perfumeHandler.CreatePerfume)
			r.Put("/perfumes/{id}", perfumeHandler.UpdatePerfume)
			r.Patch("/perfumes/{id}", perfumeHandler.PatchPerfume)
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

// ensureDefaultAdmin seeds an initial admin account ONLY if zero admin accounts exist in the database.
// Existing admin accounts and passwords are never modified or overwritten.
func ensureDefaultAdmin(db *sql.DB, adminRepo repository.AdminRepository, cfg *config.Config) {
	if adminRepo == nil {
		return
	}

	ctx := context.Background()
	count, err := adminRepo.Count(ctx)
	if err != nil {
		log.Printf("Notice: Could not query existing administrator count: %v\n", err)
		return
	}

	// If accounts already exist, NEVER overwrite or modify them
	if count > 0 {
		return
	}

	// Never seed hardcoded default credentials in production
	if cfg.ServerEnv == "production" {
		initialEmail := strings.TrimSpace(os.Getenv("INITIAL_ADMIN_EMAIL"))
		initialPass := strings.TrimSpace(os.Getenv("INITIAL_ADMIN_PASSWORD"))

		if initialEmail != "" && len(initialPass) >= 8 {
			authSvc := service.NewAuthService(adminRepo, cfg.JWTSecret)
			if _, regErr := authSvc.RegisterAdmin(ctx, initialEmail, initialPass); regErr == nil {
				log.Printf("✓ Seeded initial production administrator: %s\n", initialEmail)
			} else {
				log.Printf("Notice: Failed to seed initial production administrator: %v\n", regErr)
			}
		} else {
			log.Println("Notice: Zero admin accounts found in production database. Hardcoded default admin seeding is disabled in production for security. Supply INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD (min 8 chars) in .env or provision manually.")
		}
		return
	}

	// Development only: seed convenience default admin
	authSvc := service.NewAuthService(adminRepo, cfg.JWTSecret)
	if _, regErr := authSvc.RegisterAdmin(ctx, "admin@aurabyhani.com", "AuraLuxury2026!"); regErr == nil {
		log.Println("✓ Seeded initial default admin for development: admin@aurabyhani.com")
	}
}
