-- 000002_seed_perfumes.up.sql
-- Seed the database with the initial 6 signature Aura by HANI perfumes

INSERT INTO perfumes (
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
    best_season
) VALUES
(
    'Oud Royale',
    'oud-royale',
    'Oud, Vanilla & Smoked Amber',
    'Choose your way. Scents that stay in memory.',
    'A majestic evening blend that weaves smoky Cambodian oud with velvety Madagascan vanilla and molten golden amber. Designed for unforgettable entrances and lingering warmth.',
    12500.00,
    '100ml',
    'unisex',
    'new',
    true,
    ARRAY['Saffron', 'Bergamot', 'Incense'],
    ARRAY['Cambodian Oud', 'Turkish Rose', 'Nutmeg'],
    ARRAY['Velvet Vanilla', 'Smoked Amber', 'Cedarwood'],
    ARRAY[
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop'
    ],
    '10-14 hours',
    'Autumn & Winter'
),
(
    'Rose Éthérée',
    'rose-etheree',
    'Damask Rose, Pink Pepper & White Musk',
    'Wear your delicate aura.',
    'Dew-kissed petals harvested at daybreak in Grasse. An ethereal dance of fresh pink peppercorn, luminous morning rose, and cloud-soft white cashmere musk.',
    9800.00,
    '75ml',
    'feminine',
    'available',
    true,
    ARRAY['Pink Pepper', 'Lychee', 'Sparkling Bergamot'],
    ARRAY['Damask Rose Petals', 'Peony', 'Neroli'],
    ARRAY['White Musk', 'Clean Cedar', 'Ambroxan'],
    ARRAY[
        'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop'
    ],
    '8-10 hours',
    'Spring & Summer'
),
(
    'Nuit Dorée',
    'nuit-doree',
    'Dark Cocoa, Tobacco Leaf & Golden Honey',
    'An intoxicating golden mystery.',
    'Inspired by secret nocturnal rendezvous. Rich cured tobacco leaves submerged in raw golden honey, spiked with bittersweet cocoa and spiced tonka bean.',
    14200.00,
    '100ml',
    'unisex',
    'available',
    true,
    ARRAY['Cardamom', 'Bitter Almond', 'Blood Orange'],
    ARRAY['Cured Tobacco', 'Raw Honey', 'Dark Cocoa'],
    ARRAY['Tonka Bean', 'Bourbon Vanilla', 'Sandalwood'],
    ARRAY[
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
    ],
    '12+ hours',
    'All Year / Evening'
),
(
    'Velvet Santal',
    'velvet-santal',
    'Australian Sandalwood, Cardamom & Iris',
    'Quiet confidence bottled.',
    'A soothing second skin of creamy Mysore-style sandalwood accompanied by buttery Florentine iris and aromatic green cardamom seeds.',
    8500.00,
    '50ml',
    'unisex',
    'sold_out',
    false,
    ARRAY['Cardamom', 'Violet Leaf', 'Coriander'],
    ARRAY['Florentine Iris', 'Papyrus', 'Cypress'],
    ARRAY['Australian Sandalwood', 'Leather Accord', 'Cashmeran'],
    ARRAY[
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop'
    ],
    '8-12 hours',
    'All Seasons'
),
(
    'Soleil d''Or',
    'soleil-dor',
    'Solar Jasmine, Coconut Water & Tiare',
    'Golden warmth under the sun.',
    'Liquid sunshine. Luminous ylang-ylang and sun-drenched Tahitian gardenia swimming in crystalline coconut nectar and salted driftwood.',
    8900.00,
    '75ml',
    'feminine',
    'available',
    false,
    ARRAY['Coconut Water', 'Green Mandarin', 'Sea Salt'],
    ARRAY['Solar Jasmine', 'Tiare Flower', 'Ylang-Ylang'],
    ARRAY['Driftwood', 'Solar Amber', 'White Musk'],
    ARRAY[
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
    ],
    '7-9 hours',
    'Summer & Daytime'
),
(
    'Cuir Mystique',
    'cuir-mystique',
    'Tuscan Leather, Black Raspberry & Thyme',
    'Bold, enigmatic, magnetic.',
    'Supple Italian leather ignited by tart wild black raspberry and herbal sun-dried thyme. Seductive, dark, and utterly intoxicating.',
    13500.00,
    '100ml',
    'masculine',
    'available',
    true,
    ARRAY['Black Raspberry', 'Wild Thyme', 'Saffron'],
    ARRAY['Jasmine Sambac', 'Olibanum', 'Birch Tar'],
    ARRAY['Tuscan Leather', 'Black Suede', 'Amberwood'],
    ARRAY[
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop'
    ],
    '12-16 hours',
    'Autumn & Evening'
);
