-- Insert new trade stakeholders for Skrobaki company from uploaded image
-- Joinery, Pest Control, and Truss categories
WITH new_stakeholders AS (
  SELECT * FROM (
    VALUES 
      -- Joinery category (4 companies)
      ('Ardelle', 'Joinery', 'Projects@ardelle.com.au', '0414 157 723', NULL),
      ('Shiny Kitchen', 'Joinery', 'estimate@shinykitchens.com.au', '+61093647525', 'Factory 3, 2 Gee St Sunshine North VIC'),
      ('Cabinet Makers Melbourne', 'Joinery', 'info@cmmelbourne.com.au', '0416 481 245', 'Melbourne Australia'),
      ('Melbourne Joinery Services', 'Joinery', 'info@melbournejoinery.com.au', '0450 106 306', '5/772 Burwood Hwy, Ferntree Gully VIC 3156'),
      
      -- Pest Control category (1 company)
      ('Pest Police', 'Pest Control', 'trevor@pestpolice.com.au', '03 8773 9799', NULL),
      
      -- Truss category (7 companies)
      ('Dahlsens', 'Truss', 'craigieburnfaf.estimations@dahlsens.com.au', '03 8339 6000', '380B Hume Hwy Craigieburn 3064'),
      ('Hitech', 'Truss', 'sales@hitechtruses.com.au', NULL, '25 PROGRESS ST DANDENONG STH, VIC, 3175'),
      ('Precise Truss', 'Truss', 'sales@precisetruss.com.au', '03 9794 8911', '9 Nissan Dr Dandenong VIC'),
      ('Truss Fab', 'Truss', 'quotes@trussfab.com.au', '(03) 9799 7799', '17-18 National Drive Hallam, 3803 Victoria'),
      ('Trusses Plus', 'Truss', 'info@trussesplus.com.au', '03 9363 0077', '10-12 Westwood Drive, Ravenhall'),
      ('Victorian Timber', 'Truss', 'sales@victoriantimber.com.au', '03 7036 6745', '31A Princess Hwy, Dandenong South'),
      ('Country Truss', 'Truss', 'admin@countrytruss.com.au', '(03) 5941 1005', '4/25 Mary St, Pakenham VIC 3810')
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