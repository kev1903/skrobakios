-- Insert additional trade stakeholders from the second image
-- Sheet Metal Works, Structural Steel, Skylight, and Concreting Works categories
WITH new_stakeholders AS (
  SELECT * FROM (
    VALUES 
      -- Sheet Metal Works (2 companies)
      ('AJ Metal Pty Ltd', 'Sheet Metal Works', 'sales@ajmetal.com.au', '03 9761 4886', '33 Research Drive Croydon South VIC 3136'),
      ('Design Sheetmetal Pty Ltd', 'Sheet Metal Works', 'sales@design-group.com.au', '8720 8900', '196 Colchester Road, Bayswater North VIC 3153'),
      
      -- Structural Steel (3 companies)
      ('Hangan Steel', 'Structural Steel', 'contact@hangansteel.com.au', '(043) 331-5606', 'Bayswater VIC'),
      ('Plenary Engineering', 'Structural Steel', 'admin@plenaryengineering.com.au', '0490 045 051', '1/13 Elm Park Drive, Hoppers Crossing'),
      ('Structural Steel Fabricators', 'Structural Steel', 'domenic@structuralsteelfabricators.com.au', NULL, '39 Union Rd, Dandenong South'),
      
      -- Skylight (2 companies)
      ('Belle Skylights', 'Skylight', 'info@belleskylights.com.au', '03 9555 2388', '125 Chesterville Rd, Moorabin VIC'),
      ('Central Skylights', 'Skylight', 'estimate@centralskylights.com.au', '(03) 9999 1526', '88 Cheltenham Rd, Dandenong VIC 3175'),
      
      -- Concreting Works (2 companies)
      ('BLU RAY CONCRETING', 'Concreting Works', 'info@blurayconcretng.com.au', '(049) 008-8332', '77 Trillium Bvd, MICKLEHAM VIC 3064'),
      ('JRP Concrete', 'Concreting Works', 'Perkin.james@yahoo.com', '0409 351 426', '167 Botanica Springs Blvd, Brookfield, VIC, 3338')
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