-- 000003_expand_perfumes_schema.down.sql
-- AURA by HANI: Rollback Migration 000003
BEGIN;

-- 1. Map any newly inserted women/men rows back to feminine/masculine before tightening
UPDATE public.perfumes SET category = 'feminine' WHERE category = 'women';
UPDATE public.perfumes SET category = 'masculine' WHERE category = 'men';

-- 2. Drop newly added columns (lossy operation)
ALTER TABLE public.perfumes DROP COLUMN IF EXISTS short_description;
ALTER TABLE public.perfumes DROP COLUMN IF EXISTS fragrance_type;

-- 3. Drop widened category check constraint
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT c.conname, pg_get_constraintdef(c.oid) AS condef
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'perfumes' 
          AND n.nspname = 'public'
          AND c.contype = 'c' 
          AND EXISTS (
              SELECT 1 FROM pg_attribute a 
              WHERE a.attrelid = c.conrelid 
                AND a.attnum = ANY(c.conkey) 
                AND a.attname = 'category'
          )
    ) LOOP
        IF r.condef ILIKE '%category%' THEN
            EXECUTE 'ALTER TABLE public.perfumes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END IF;
    END LOOP;
END $$;

-- 4. Restore original category constraint
ALTER TABLE public.perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('unisex', 'feminine', 'masculine'));

COMMIT;
