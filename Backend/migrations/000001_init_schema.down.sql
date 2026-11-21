-- 000001_init_schema.down.sql
-- Rollback schema changes cleanly

DROP INDEX IF EXISTS idx_perfumes_created_at;
DROP INDEX IF EXISTS idx_perfumes_featured;
DROP INDEX IF EXISTS idx_perfumes_category;
DROP INDEX IF EXISTS idx_perfumes_status;
DROP INDEX IF EXISTS idx_perfumes_slug;

DROP TABLE IF EXISTS perfumes;
DROP TABLE IF EXISTS admins;
