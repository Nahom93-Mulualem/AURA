-- 000003_expand_perfumes_schema.down.sql
-- AURA by HANI: Rollback Migration 000003
BEGIN;

-- 1. Map any newly inserted women/men rows back to feminine/masculine before tightening
UPDATE perfumes SET category = 'feminine' WHERE category = 'women';
UPDATE perfumes SET category = 'masculine' WHERE category = 'men';

-- 2. Drop newly added columns (lossy operation)
ALTER TABLE perfumes DROP COLUMN IF EXISTS short_description;
ALTER TABLE perfumes DROP COLUMN IF EXISTS fragrance_type;

-- 3. Drop widened category check constraint
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT c.conname 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'perfumes' 
          AND c.contype = 'c' 
          AND EXISTS (
              SELECT 1 FROM pg_attribute a 
              WHERE a.attrelid = c.conrelid 
                AND a.attnum = ANY(c.conkey) 
                AND a.attname = 'category'
          )
    ) LOOP
        EXECUTE 'ALTER TABLE perfumes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 4. Restore original category constraint
ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('unisex', 'feminine', 'masculine'));

COMMIT;
