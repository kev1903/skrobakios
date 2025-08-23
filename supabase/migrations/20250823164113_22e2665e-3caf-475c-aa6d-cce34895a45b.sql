-- Insert final batch of trade stakeholders from the fourth image
-- Roofing (Metal), Roofing (Tile), Door Hardware and Supplies, Structural Engineering, and Plastering
WITH new_stakeholders AS (
  SELECT * FROM (
    VALUES 
      -- Roofing (Metal) (2 companies)
      ('Monumental Metal Roofing', 'Roofing (Metal)', 'info@mmroof.com.au', NULL, NULL),
      ('First Class Roof Plumbing', 'Roofing (Metal)', 'connor@firstclassroofplumbing.com.au', NULL, NULL),
      
      -- Roofing (Tile) (1 company)
      ('Gilbert Roofing', 'Roofing (Tile)', 'info@gilbertroofing.com.au', '0412 580 703', '879 Wellington Rd Rowville 3178'),
      
      -- Door Hardware and Supplies (1 company)
      ('The Door Store', 'Door Hardware and Supplies', 'hardware@thedoorstore.com.au', '(03)9532 3055', '122 Cochranes Road, Moorabbin 3189'),
      
      -- Structural Engineering (1 company)
      ('Infradesign', 'Structural Engineering', 'Stanley@infradesign.com.au', '+61 4 3131 3280', 'Level 19, Regus Como, 644 Chapel St, South Yarra'),
      
      -- Plastering (1 company)
      ('Vista Plastering', 'Plastering', 'info@vistaplasteringmelbourne.com.au', '0424 714 788', 'Suite 75/139 Cardigan St, Carlton, Vic, 3053')
  ) AS t(display_name, trade_industry, primary_email, primary_phone, address)
), ins AS (
  INSERT INTO public.stakeholders (
    id, company_id, display_name, category, trade_industry, primary_email, primary_phone, status, created_at, notes
  )
  SELECT 
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,
    ns.display_name,
    'trade'::stakeholder_category,
    ns.trade_industry,
    ns.primary_email,
    ns.primary_phone,
    'active'::stakeholder_status,
    now(),
    CASE WHEN ns.address IS NOT NULL THEN 'Address: ' || ns.address ELSE NULL END
  FROM new_stakeholders ns
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stakeholders s
    WHERE s.company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid
      AND lower(s.display_name) = lower(ns.display_name)
  )
  RETURNING 1
)
SELECT count(*) AS inserted_count FROM ins;