-- 000004_contract_perfumes_schema.up.sql
-- AURA by HANI: Contract schema to standardize on women, men, unisex
BEGIN;

-- 1. Safety Check: Abort if unsupported or NULL categories exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM perfumes 
        WHERE category IS NULL 
           OR category NOT IN ('women', 'men', 'unisex', 'feminine', 'masculine')
    ) THEN
        RAISE EXCEPTION 'Aborting Migration 000004: Found unexpected or NULL category values.';
    END IF;
END $$;

-- 2. Convert remaining legacy database values in place
UPDATE perfumes SET category = 'women' WHERE category = 'feminine';
UPDATE perfumes SET category = 'men' WHERE category = 'masculine';

-- 3. Verify zero legacy values remain
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM perfumes WHERE category IN ('feminine', 'masculine')) THEN
        RAISE EXCEPTION 'Contract migration failed: legacy category values still present.';
    END IF;
END $$;

-- 4. Dynamically drop widened category constraint
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

-- 5. Apply final contracted constraint
ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('women', 'men', 'unisex'));

COMMIT;
