-- Insert last batch of trade stakeholders from the fifth image
-- Tiling and Roof Restoration categories
WITH new_stakeholders AS (
  SELECT * FROM (
    VALUES 
      -- Tiling (2 companies)
      ('Askari Tiling', 'Tiling', 'askaritilingservices.1@gmail.com', '(047) 001-2764', NULL),
      ('Ali', 'Tiling', 'alitiling1@gmail.com', NULL, NULL),
      
      -- Roof Restoration (1 company)
      ('Metropolitan Roof Repairs', 'Roof Restoration', 'metropolitanroofing.vic@gmail.com', NULL, NULL)
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