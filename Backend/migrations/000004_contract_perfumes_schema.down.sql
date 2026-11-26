-- 000004_contract_perfumes_schema.down.sql
-- AURA by HANI: Rollback Migration 000004 (Restores expanded 5-category state from Migration 000003 UP)
BEGIN;

-- 1. Dynamically drop contracted category constraint on public.perfumes
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

-- 2. Restore expanded five-category constraint (matches Migration 000003 UP)
ALTER TABLE public.perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('feminine', 'masculine', 'unisex', 'women', 'men'));

-- 3. Reverse data conversion: convert women -> feminine, men -> masculine
UPDATE public.perfumes SET category = 'feminine' WHERE category = 'women';
UPDATE public.perfumes SET category = 'masculine' WHERE category = 'men';

-- 4. Verify zero women/men values remain
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.perfumes WHERE category IN ('women', 'men')) THEN
        RAISE EXCEPTION 'Rollback failed: unconverted women/men category values remain.';
    END IF;
END $$;

COMMIT;
