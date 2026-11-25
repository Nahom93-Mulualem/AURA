package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"aura-backend/internal/config"
	"aura-backend/internal/database"
	"aura-backend/internal/handlers"
	"aura-backend/internal/middleware"
	"aura-backend/internal/models"
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
		// Health check (verifies service and database readiness without exposing internals)
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			if db != nil {
				ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
				defer cancel()
				if err := db.PingContext(ctx); err != nil {
					handlers.SendJSON(w, http.StatusServiceUnavailable, map[string]string{
						"status":   "unhealthy",
						"service":  "Aura by HANI API",
						"database": "unavailable",
					})
					return
				}
			} else if cfg.ServerEnv == "production" {
				handlers.SendJSON(w, http.StatusServiceUnavailable, map[string]string{
					"status":   "unhealthy",
					"service":  "Aura by HANI API",
					"database": "disconnected",
				})
				return
			}

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

	// 7. Start HTTP Server with production timeouts & graceful shutdown
	server := newHTTPServer(cfg.ServerPort, r)

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("✓ Aura by HANI API listening on http://localhost:%s\n", cfg.ServerPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		log.Fatalf("Server startup failed: %v\n", err)
	case sig := <-stop:
		log.Printf("Shutdown signal received (%s). Initiating graceful shutdown...\n", sig)

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown failed: %v. Forcing server close.\n", err)
			_ = server.Close()
		} else {
			log.Println("✓ Aura by HANI API server exited cleanly.")
		}
	}
}

// newHTTPServer configures production-ready connection and transfer timeouts
func newHTTPServer(port string, handler http.Handler) *http.Server {
	return &http.Server{
		Addr:              fmt.Sprintf(":%s", port),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,  // Prevents Slowloris attacks
		ReadTimeout:       30 * time.Second, // Allows legitimate 5MB photo uploads without stalling
		WriteTimeout:      60 * time.Second, // Allows Cloudinary streaming & JSON responses to finish
		IdleTimeout:       60 * time.Second, // Reclaims idle keep-alive connections
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
		if cfg.ServerEnv == "production" {
			log.Fatalf("Fatal [CRITICAL SECURITY]: Failed to verify administrator state in production database: %v\n", err)
		}
		log.Printf("Notice: Could not query existing administrator count: %v\n", err)
		return
	}

	// 1. Temporary production administrator password recovery
	// Only active when RESET_ADMIN_PASSWORD is explicitly configured and non-empty.
	if resetPass := os.Getenv("RESET_ADMIN_PASSWORD"); resetPass != "" {
		handleAdminPasswordRecovery(ctx, adminRepo, cfg, resetPass)
	}

	// If accounts already exist, NEVER overwrite or modify them
	if count > 0 {
		return
	}

	// Never seed hardcoded default credentials in production
	if cfg.ServerEnv == "production" {
		initialEmail := strings.TrimSpace(os.Getenv("INITIAL_ADMIN_EMAIL"))
		rawPass := os.Getenv("INITIAL_ADMIN_PASSWORD")

		// Validate password is not empty, not whitespace-only, and meets minimum 8 character length.
		// Preserves exact original password without trimming leading/trailing spaces.
		if initialEmail != "" && strings.TrimSpace(rawPass) != "" && len(rawPass) >= 8 {
			authSvc := service.NewAuthService(adminRepo, cfg.JWTSecret)
			if _, regErr := authSvc.RegisterAdmin(ctx, initialEmail, rawPass); regErr == nil {
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

// handleAdminPasswordRecovery provides a temporary, non-destructive password recovery mechanism
// for an existing administrator without deleting or recreating the account.
func handleAdminPasswordRecovery(ctx context.Context, adminRepo repository.AdminRepository, cfg *config.Config, rawResetPass string) {
	if strings.TrimSpace(rawResetPass) == "" || len(rawResetPass) < 8 {
		log.Println("Notice [ADMIN RECOVERY]: RESET_ADMIN_PASSWORD provided but rejected (must be at least 8 characters and not whitespace-only).")
		return
	}

	// Target administrator candidate emails
	var candidates []string
	if email := strings.TrimSpace(os.Getenv("RESET_ADMIN_EMAIL")); email != "" {
		candidates = append(candidates, email, strings.ToLower(email))
	}
	if email := strings.TrimSpace(os.Getenv("INITIAL_ADMIN_EMAIL")); email != "" {
		candidates = append(candidates, email, strings.ToLower(email))
	}
	candidates = append(candidates,
		"hanigebremedhin21@gmail.com",
		"Hanigebremedhin21@gmail.com",
		"admin@aurabyhani.com",
	)

	var targetAdmin *models.Admin
	for _, candidate := range candidates {
		admin, err := adminRepo.GetByEmail(ctx, candidate)
		if err == nil && admin != nil {
			targetAdmin = admin
			break
		}
	}

	if targetAdmin == nil {
		log.Println("Notice [ADMIN RECOVERY]: Could not locate administrator account for password reset. Set RESET_ADMIN_EMAIL to match the account email.")
		return
	}

	authSvc := service.NewAuthService(adminRepo, cfg.JWTSecret)
	newHash, err := authSvc.HashPassword(rawResetPass)
	if err != nil {
		log.Printf("Notice [ADMIN RECOVERY]: Failed to hash recovery password: %v\n", err)
		return
	}

	if err := adminRepo.UpdatePassword(ctx, targetAdmin.ID, newHash); err != nil {
		log.Printf("Notice [ADMIN RECOVERY]: Failed to update administrator password in database: %v\n", err)
		return
	}

	log.Printf("✓ [ADMIN RECOVERY]: Successfully updated password for administrator (%s) in place. IMPORTANT: Remove RESET_ADMIN_PASSWORD from Render environment variables now.\n", targetAdmin.Email)
}
