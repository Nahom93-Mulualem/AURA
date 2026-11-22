# PowerShell Migration Runner for Aura by HANI
# Usage: .\Backend\scripts\migrate.ps1

Write-Host "Running PostgreSQL Migrations for Aura by HANI (aura_db)..." -ForegroundColor Cyan

$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    # Fallback to system PATH
    $psqlPath = "psql"
}

$env:PGPASSWORD = "postgres2"

$schemaFile = "Backend\migrations\000001_init_schema.up.sql"
$seedFile   = "Backend\migrations\000002_seed_perfumes.up.sql"

Write-Host "1. Applying Schema ($schemaFile)..." -ForegroundColor Yellow
& $psqlPath -U postgres -h localhost -p 5432 -d aura_db -f $schemaFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Schema migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "2. Applying Seed Data ($seedFile)..." -ForegroundColor Yellow
& $psqlPath -U postgres -h localhost -p 5432 -d aura_db -f $seedFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Seed migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Migrations completed successfully!" -ForegroundColor Green
Write-Host "Database 'aura_db' is now initialized with tables and initial perfumes." -ForegroundColor Green
