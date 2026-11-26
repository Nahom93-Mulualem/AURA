-- 000003_expand_perfumes_schema.up.sql
-- AURA by HANI: Expand schema to support fragrance_type, short_description, and widened categories
BEGIN;

-- 1. Pre-condition Safety Check: Abort if unsupported or NULL categories exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM perfumes 
        WHERE category IS NULL 
           OR category NOT IN ('unisex', 'feminine', 'masculine', 'women', 'men')
    ) THEN
        RAISE EXCEPTION 'Aborting Migration 000003: Found unexpected or NULL category values in perfumes table.';
    END IF;
END $$;

-- 2. Dynamically drop existing category CHECK constraint
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
          AND n.nspname = current_schema()
          AND c.contype = 'c'
          AND EXISTS (
              SELECT 1 FROM pg_attribute a 
              WHERE a.attrelid = c.conrelid 
                AND a.attnum = ANY(c.conkey) 
                AND a.attname = 'category'
          )
    ) LOOP
        IF r.condef ILIKE '%category%' THEN
            RAISE NOTICE 'Dropping category constraint: % (definition: %)', r.conname, r.condef;
            EXECUTE 'ALTER TABLE perfumes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        END IF;
    END LOOP;
END $$;

-- 3. Widen category constraint to accept all 5 valid categories (zero row updates)
ALTER TABLE perfumes ADD CONSTRAINT perfumes_category_check 
    CHECK (category IN ('feminine', 'masculine', 'unisex', 'women', 'men'));

-- 4. Add nullable fragrance_type column
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS fragrance_type VARCHAR(50) DEFAULT NULL;
ALTER TABLE perfumes DROP CONSTRAINT IF EXISTS perfumes_fragrance_type_check;
ALTER TABLE perfumes ADD CONSTRAINT perfumes_fragrance_type_check
    CHECK (fragrance_type IS NULL OR fragrance_type IN (
        'eau_de_parfum',
        'eau_de_toilette',
        'extrait_de_parfum',
        'perfume_oil',
        'bakhoor',
        'body_splash'
    ));

-- 5. Add nullable short_description column
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS short_description VARCHAR(140) DEFAULT NULL;

COMMIT;
