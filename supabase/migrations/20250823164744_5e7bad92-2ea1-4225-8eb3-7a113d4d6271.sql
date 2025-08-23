-- Add tags to all existing stakeholders based on their category and trade_industry
UPDATE public.stakeholders 
SET tags = CASE 
  WHEN category = 'client' THEN 
    ARRAY['Client', 'Customer']
  WHEN category = 'trade' AND trade_industry IS NOT NULL THEN 
    ARRAY['Trade', 'Contractor', trade_industry]
  WHEN category = 'supplier' THEN 
    ARRAY['Supplier', 'Vendor'] 
  WHEN category = 'consultant' THEN 
    ARRAY['Consultant', 'Professional Service']
  ELSE 
    ARRAY[INITCAP(category::text)]
END
WHERE tags IS NULL OR array_length(tags, 1) IS NULL;

-- Add additional specific tags based on trade industry for better searchability
UPDATE public.stakeholders 
SET tags = tags || ARRAY[
  CASE 
    WHEN trade_industry ILIKE '%plumb%' THEN 'Plumbing'
    WHEN trade_industry ILIKE '%electric%' THEN 'Electrical' 
    WHEN trade_industry ILIKE '%roof%' THEN 'Roofing'
    WHEN trade_industry ILIKE '%til%' THEN 'Tiling'
    WHEN trade_industry ILIKE '%paint%' THEN 'Painting'
    WHEN trade_industry ILIKE '%concret%' THEN 'Concrete'
    WHEN trade_industry ILIKE '%steel%' THEN 'Steel'
    WHEN trade_industry ILIKE '%engineer%' THEN 'Engineering'
    WHEN trade_industry ILIKE '%floor%' THEN 'Flooring'
    WHEN trade_industry ILIKE '%door%' OR trade_industry ILIKE '%hardware%' THEN 'Hardware'
    WHEN trade_industry ILIKE '%plaster%' THEN 'Plastering'
    WHEN trade_industry ILIKE '%metal%' THEN 'Metalwork'
    ELSE NULL
  END
]
WHERE category = 'trade' 
  AND trade_industry IS NOT NULL 
  AND NOT (tags @> ARRAY[
    CASE 
      WHEN trade_industry ILIKE '%plumb%' THEN 'Plumbing'
      WHEN trade_industry ILIKE '%electric%' THEN 'Electrical'
      WHEN trade_industry ILIKE '%roof%' THEN 'Roofing'
      WHEN trade_industry ILIKE '%til%' THEN 'Tiling'
      WHEN trade_industry ILIKE '%paint%' THEN 'Painting'
      WHEN trade_industry ILIKE '%concret%' THEN 'Concrete'
      WHEN trade_industry ILIKE '%steel%' THEN 'Steel'
      WHEN trade_industry ILIKE '%engineer%' THEN 'Engineering'
      WHEN trade_industry ILIKE '%floor%' THEN 'Flooring'
      WHEN trade_industry ILIKE '%door%' OR trade_industry ILIKE '%hardware%' THEN 'Hardware'
      WHEN trade_industry ILIKE '%plaster%' THEN 'Plastering'
      WHEN trade_industry ILIKE '%metal%' THEN 'Metalwork'
      ELSE 'N/A'
    END
  ]);