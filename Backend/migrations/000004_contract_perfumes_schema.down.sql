-- 000004_contract_perfumes_schema.down.sql
-- AURA by HANI: Rollback Migration 000004 (Data-preserving reverse conversion before constraint restoration)
BEGIN;

-- 1. Re-widen constraint to temporarily accept all 5 categories
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

ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('feminine', 'masculine', 'unisex', 'women', 'men'));

-- 2. Reverse data conversion: convert women -> feminine, men -> masculine
UPDATE perfumes SET category = 'feminine' WHERE category = 'women';
UPDATE perfumes SET category = 'masculine' WHERE category = 'men';

-- 3. Verify zero women/men values remain
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM perfumes WHERE category IN ('women', 'men')) THEN
        RAISE EXCEPTION 'Rollback failed: unconverted women/men category values remain.';
    END IF;
END $$;

-- 4. Restore original strict 3-value category constraint
ALTER TABLE perfumes DROP CONSTRAINT IF EXISTS perfumes_category_check;
ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('unisex', 'feminine', 'masculine'));

COMMIT;
