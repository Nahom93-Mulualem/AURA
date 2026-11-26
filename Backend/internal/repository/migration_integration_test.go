package repository_test

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	_ "github.com/lib/pq"
)

func getAdminDB(t *testing.T) (*sql.DB, bool) {
	// Read connection params from environment or defaults
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	pass := os.Getenv("DB_PASSWORD")
	if pass == "" {
		pass = "postgres2"
	}

	// Connect to default maintenance database 'postgres' to safely provision disposable test database
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=disable", host, port, user, pass)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		t.Skipf("Skipping integration test: cannot connect to postgres host: %v", err)
		return nil, false
	}
	if err := db.Ping(); err != nil {
		t.Skipf("Skipping integration test: PostgreSQL server not reachable at %s:%s (%v)", host, port, err)
		return nil, false
	}
	return db, true
}

func readMigrationSQL(t *testing.T, filename string) string {
	// Search in Backend/migrations or ../../migrations
	paths := []string{
		filepath.Join("..", "..", "migrations", filename),
		filepath.Join("migrations", filename),
		filepath.Join("Backend", "migrations", filename),
	}
	for _, p := range paths {
		if data, err := os.ReadFile(p); err == nil {
			return string(data)
		}
	}
	t.Fatalf("Could not locate migration file: %s", filename)
	return ""
}

func TestDisposablePostgreSQL_MigrationMatrix(t *testing.T) {
	adminDB, ok := getAdminDB(t)
	if !ok {
		return
	}
	defer adminDB.Close()

	disposableDBName := "aura_disposable_test_migration_matrix"

	// 1. Teardown existing test DB if leftover
	_, _ = adminDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s WITH (FORCE);", disposableDBName))

	// 2. Create isolated disposable database
	_, err := adminDB.Exec(fmt.Sprintf("CREATE DATABASE %s;", disposableDBName))
	if err != nil {
		t.Fatalf("Failed to create disposable test database %s: %v", disposableDBName, err)
	}
	t.Logf("✓ Provisioned isolated disposable database: %s", disposableDBName)

	// Ensure teardown at end of test run
	defer func() {
		_, _ = adminDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s WITH (FORCE);", disposableDBName))
		t.Logf("✓ Dropped disposable database: %s", disposableDBName)
	}()

	// 3. Connect to the disposable database
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	pass := os.Getenv("DB_PASSWORD")
	if pass == "" {
		pass = "postgres2"
	}
	testConnStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, pass, disposableDBName)
	testDB, err := sql.Open("postgres", testConnStr)
	if err != nil {
		t.Fatalf("Failed to connect to disposable test database: %v", err)
	}
	defer testDB.Close()

	// ==========================================
	// Suite 1: Baseline Migrations 000001 & 000002
	// ==========================================
	t.Run("Suite1_Baseline_000001_and_000002", func(t *testing.T) {
		m1 := readMigrationSQL(t, "000001_init_schema.up.sql")
		if _, err := testDB.Exec(m1); err != nil {
			t.Fatalf("Failed running 000001_init_schema.up.sql: %v", err)
		}

		m2 := readMigrationSQL(t, "000002_seed_perfumes.up.sql")
		if _, err := testDB.Exec(m2); err != nil {
			t.Fatalf("Failed running 000002_seed_perfumes.up.sql: %v", err)
		}

		// Verify 6 initial seeded perfumes exist
		var count int
		if err := testDB.QueryRow("SELECT COUNT(*) FROM perfumes").Scan(&count); err != nil {
			t.Fatalf("Query perfumes count failed: %v", err)
		}
		if count < 6 {
			t.Fatalf("Expected at least 6 perfumes, got %d", count)
		}

		// Verify columns fragrance_type and short_description do NOT exist yet
		var colCount int
		err := testDB.QueryRow(`
			SELECT COUNT(*) FROM information_schema.columns 
			WHERE table_name = 'perfumes' AND column_name IN ('fragrance_type', 'short_description')
		`).Scan(&colCount)
		if err != nil {
			t.Fatalf("Query information_schema failed: %v", err)
		}
		if colCount != 0 {
			t.Fatalf("Expected 0 new columns before migration 000003, got %d", colCount)
		}
		t.Logf("✓ Suite 1 Baseline: %d perfumes seeded, original schema verified", count)
	})

	// ==========================================
	// Suite 2: Expand Migration 000003
	// ==========================================
	t.Run("Suite2_Expand_Migration_000003", func(t *testing.T) {
		m3 := readMigrationSQL(t, "000003_expand_perfumes_schema.up.sql")
		if _, err := testDB.Exec(m3); err != nil {
			t.Fatalf("Failed running 000003_expand_perfumes_schema.up.sql: %v", err)
		}

		// Verify columns now exist
		var colCount int
		err := testDB.QueryRow(`
			SELECT COUNT(*) FROM information_schema.columns 
			WHERE table_name = 'perfumes' AND column_name IN ('fragrance_type', 'short_description')
		`).Scan(&colCount)
		if err != nil || colCount != 2 {
			t.Fatalf("Expected 2 new columns after migration 000003, got %d (err: %v)", colCount, err)
		}

		// Test inserting a perfume with 'women' category and valid fragrance_type
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, short_description, price, size_ml, category, fragrance_type, status)
			VALUES ('Rose Test', 'rose-test', 'Sub', 'Tag', 'Desc', 'Short desc max 140', 2500, '50ml', 'women', 'eau_de_parfum', 'available')
		`)
		if err != nil {
			t.Fatalf("Failed inserting perfume with 'women' and 'eau_de_parfum': %v", err)
		}

		// Test inserting a perfume with 'men' category and 'bakhoor'
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, short_description, price, size_ml, category, fragrance_type, status)
			VALUES ('Oud Test', 'oud-test', 'Sub', 'Tag', 'Desc', 'Short desc', 3500, '50ml', 'men', 'bakhoor', 'available')
		`)
		if err != nil {
			t.Fatalf("Failed inserting perfume with 'men' and 'bakhoor': %v", err)
		}

		// Test inserting with legacy 'feminine' is still accepted in expand phase
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, price, size_ml, category, status)
			VALUES ('Legacy Fem', 'legacy-fem', 'Sub', 'Tag', 'Desc', 4000, '100ml', 'feminine', 'available')
		`)
		if err != nil {
			t.Fatalf("Failed inserting perfume with legacy 'feminine': %v", err)
		}

		// Verify invalid fragrance_type is rejected by check constraint
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, price, size_ml, category, fragrance_type, status)
			VALUES ('Invalid Type', 'invalid-type', 'Sub', 'Tag', 'Desc', 5000, '100ml', 'unisex', 'eau_de_cologne', 'available')
		`)
		if err == nil {
			t.Fatalf("Expected error inserting invalid fragrance_type 'eau_de_cologne', but it succeeded")
		}
		t.Logf("✓ Suite 2 Expand: 5-category constraint, fragrance_type enum, and short_description verified")
	})

	// ==========================================
	// Suite 3: Contract Migration 000004
	// ==========================================
	t.Run("Suite3_Contract_Migration_000004", func(t *testing.T) {
		m4 := readMigrationSQL(t, "000004_contract_perfumes_schema.up.sql")
		if _, err := testDB.Exec(m4); err != nil {
			t.Fatalf("Failed running 000004_contract_perfumes_schema.up.sql: %v", err)
		}

		// Verify 0 legacy categories remain in DB
		var legacyCount int
		err := testDB.QueryRow("SELECT COUNT(*) FROM perfumes WHERE category IN ('feminine', 'masculine')").Scan(&legacyCount)
		if err != nil || legacyCount != 0 {
			t.Fatalf("Expected 0 legacy categories after migration 000004, got %d (err: %v)", legacyCount, err)
		}

		// Verify all converted to women / men / unisex
		var canonicalCount int
		err = testDB.QueryRow("SELECT COUNT(*) FROM perfumes WHERE category IN ('women', 'men', 'unisex')").Scan(&canonicalCount)
		if err != nil || canonicalCount == 0 {
			t.Fatalf("Expected non-zero canonical categories after migration 000004, got %d", canonicalCount)
		}

		// Verify inserting 'feminine' is now rejected by contracted constraint
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, price, size_ml, category, status)
			VALUES ('Rejected Fem', 'rejected-fem', 'Sub', 'Tag', 'Desc', 4000, '100ml', 'feminine', 'available')
		`)
		if err == nil {
			t.Fatalf("Expected check constraint violation inserting 'feminine' after 000004 up, but succeeded")
		}
		t.Logf("✓ Suite 3 Contract: In-place conversion complete, strict check constraint active")
	})

	// ==========================================
	// Suite 4: Contract Rollback 000004 down
	// ==========================================
	t.Run("Suite4_Contract_Rollback_000004_down", func(t *testing.T) {
		m4Down := readMigrationSQL(t, "000004_contract_perfumes_schema.down.sql")
		if _, err := testDB.Exec(m4Down); err != nil {
			t.Fatalf("Failed running 000004_contract_perfumes_schema.down.sql: %v", err)
		}

		// Verify women and men were reverse converted to feminine and masculine
		var newCount int
		err := testDB.QueryRow("SELECT COUNT(*) FROM perfumes WHERE category IN ('women', 'men')").Scan(&newCount)
		if err != nil || newCount != 0 {
			t.Fatalf("Expected 0 'women'/'men' rows after 000004 down rollback, got %d (err: %v)", newCount, err)
		}

		// Verify original constraint is enforced (rejecting 'women')
		_, err = testDB.Exec(`
			INSERT INTO perfumes (name, slug, subtitle, tagline, description, price, size_ml, category, status)
			VALUES ('Rejected Women', 'rejected-women', 'Sub', 'Tag', 'Desc', 4000, '100ml', 'women', 'available')
		`)
		if err == nil {
			t.Fatalf("Expected check constraint violation inserting 'women' after 000004 down, but succeeded")
		}
		t.Logf("✓ Suite 4 Contract Rollback: Reverse conversion and 3-category constraint restored")
	})

	// ==========================================
	// Suite 5: Expand Rollback 000003 down
	// ==========================================
	t.Run("Suite5_Expand_Rollback_000003_down", func(t *testing.T) {
		m3Down := readMigrationSQL(t, "000003_expand_perfumes_schema.down.sql")
		if _, err := testDB.Exec(m3Down); err != nil {
			t.Fatalf("Failed running 000003_expand_perfumes_schema.down.sql: %v", err)
		}

		// Verify columns fragrance_type and short_description were dropped
		var colCount int
		err := testDB.QueryRow(`
			SELECT COUNT(*) FROM information_schema.columns 
			WHERE table_name = 'perfumes' AND column_name IN ('fragrance_type', 'short_description')
		`).Scan(&colCount)
		if err != nil || colCount != 0 {
			t.Fatalf("Expected 0 new columns after 000003 down rollback, got %d (err: %v)", colCount, err)
		}
		t.Logf("✓ Suite 5 Expand Rollback: Schema cleanly restored to initial baseline")
	})

	// ==========================================
	// Suite 6: Deliberate Failure Atomicity Test
	// ==========================================
	t.Run("Suite6_Deliberate_Failure_Atomicity", func(t *testing.T) {
		// Re-run 000003 up
		m3 := readMigrationSQL(t, "000003_expand_perfumes_schema.up.sql")
		if _, err := testDB.Exec(m3); err != nil {
			t.Fatalf("Failed re-running 000003_expand_perfumes_schema.up.sql: %v", err)
		}

		// Attempt a failing transaction: valid column add followed by syntax error
		failingMigrationSQL := `
		BEGIN;
		ALTER TABLE perfumes ADD COLUMN temp_test_col VARCHAR(10);
		-- Deliberate error on nonexistent table:
		INSERT INTO nonexistent_table_xyz VALUES (1);
		COMMIT;
		`
		_, err := testDB.Exec(failingMigrationSQL)
		if err == nil {
			t.Fatalf("Expected deliberate error in transaction, but execution succeeded")
		}
		// Send ROLLBACK to clear aborted transaction block in connection pool
		_, _ = testDB.Exec("ROLLBACK;")

		// Verify temp_test_col does NOT exist due to transaction rollback
		var tempColCount int
		err = testDB.QueryRow(`
			SELECT COUNT(*) FROM information_schema.columns 
			WHERE table_name = 'perfumes' AND column_name = 'temp_test_col'
		`).Scan(&tempColCount)
		if err != nil {
			t.Fatalf("Query failed: %v", err)
		}
		if tempColCount != 0 {
			t.Fatalf("Expected temp_test_col to be rolled back, found count %d", tempColCount)
		}
		t.Logf("✓ Suite 6 Atomicity: Failed migration leaves database completely unmutated")
	})
}
