-- custom_danu_export.sql
-- Exported record for custom perfume: danu
-- Preserves existing UUID, Cloudinary CDN URL, and fragrance attributes.
-- Safe and idempotent: Uses ON CONFLICT (slug) DO NOTHING.

INSERT INTO perfumes (
    id,
    name,
    slug,
    subtitle,
    tagline,
    description,
    price,
    size_ml,
    category,
    status,
    featured,
    top_notes,
    heart_notes,
    base_notes,
    images,
    longevity,
    best_season,
    created_at,
    updated_at
) VALUES (
    '8145f0f5-c977-4f58-be54-dcd6fb164d81',
    'danu',
    'danu',
    'amber',
    'Scents that stay in memory.',
    'Bespoke artisanal fragrance with notes of precious woods and florals.',
    4300.00,
    '100ml',
    'unisex',
    'available',
    true,
    ARRAY['Bergamot', 'Cardamom'],
    ARRAY['Amber', 'Rose'],
    ARRAY['Oud', 'Musk'],
    ARRAY['https://res.cloudinary.com/df189mjh/image/upload/v1795624308/aura/perfumes/k8jlcjnw399kt0iv7keh.jpg'],
    '',
    '',
    '2026-11-25 19:31:49.158832+03',
    '2026-11-25 19:31:49.158832+03'
)
ON CONFLICT (slug) DO NOTHING;
