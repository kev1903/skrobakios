-- Insert more trade stakeholders from the third image
-- Site Camera, Scaffolding, Carpet, and Painting categories
WITH new_stakeholders AS (
  SELECT * FROM (
    VALUES 
      -- Site Camera (5 companies)
      ('1300 Site Cam', 'Site Camera', 'info@1300sitecam.com.au', NULL, NULL),
      ('Building Site CCTV', 'Site Camera', 'info@buildingsitecctv.com.au', NULL, NULL),
      ('Site View', 'Site Camera', 'info@siteview.com.au', NULL, NULL),
      ('Security Camera Specialist', 'Site Camera', 'info@securitycameraspecialist.com.au', NULL, NULL),
      ('Bandit Security', 'Site Camera', 'info@banditsecurity.com.au', '1300 022 634', NULL),
      
      -- Scaffolding (2 companies)
      ('All Star Access Hire', 'Scaffolding', 'matt@allstaraccesshire.com.au', NULL, NULL),
      ('Edge Deck', 'Scaffolding', 'info@edgedeck.com.au', NULL, NULL),
      
      -- Carpet (2 companies)
      ('Fowles Auctions + Sales', 'Carpet', 'Travis.Rossiter@fowles.com.au', '(03) 9265 5542', '2099 Princes Hwy (cnr Blackburn Rd) | Clayton Victoria'),
      ('Pakenham Carpet Court', 'Carpet', 'sales2@pakenhamcarpetcourt.com.au', '03 5941 1734', '1/907 Princess Highway, Pakenham, VIC 3810'),
      
      -- Painting (1 company)
      ('Unique Painting', 'Painting', 'info@uniquepaintingvic.com.au', NULL, NULL)
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