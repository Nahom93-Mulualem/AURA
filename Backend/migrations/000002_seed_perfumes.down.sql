-- 000002_seed_perfumes.down.sql
-- Clean seed data

DELETE FROM perfumes WHERE slug IN (
    'oud-royale',
    'rose-etheree',
    'nuit-doree',
    'velvet-santal',
    'soleil-dor',
    'cuir-mystique'
);
