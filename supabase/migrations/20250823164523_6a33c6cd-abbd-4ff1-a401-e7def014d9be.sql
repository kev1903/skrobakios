-- Insert client stakeholders from the client list image
-- All entries are clients with their project details
WITH new_clients AS (
  SELECT * FROM (
    VALUES 
      -- Client stakeholders
      ('Nihla Fouz', 'info@ccasgroup.com.au', '+61 401 467 855', '18 Monomeath Ave, Canterbury VIC 3126, Australia', 'Extension'),
      ('Nihla Fouz', 'info@ccasgroup.com.au', '+61 401 467 855', '1354 & 1356 High Street, Malvern', 'Extension, Change of Use'),
      ('Emma Arkesteijn', 'Emma.Arkesteijn@development.vic.gov.au', '+61 404 476 645', '38 Riverview Terrace, Bulleen', 'Design'),
      ('Barnabas Mutemararo', 'bkmutemararo@gmail.com', '+61 481 945 039', '50 Hawtin Street, Templestowe VIC 3106', 'Renovation'),
      ('Vishal Bhasin', 'vishalbhasin73@gmail.com', NULL, '43 Iris Rd, Glen Iris VIC 3146, Australia', 'Landscape'),
      ('Peter Tiyago', 'petertiyago@gmail.com', NULL, '105 Walkers Road, Mt. Eliza 3930', 'Project Estimate'),
      ('Insaf Fouz', '17gordonst@gmail.com', NULL, '17 Gordon St, Balwyn VIC', 'Extension'),
      ('Lyall Johasan', 'lyalljohasan@gmail.com', NULL, '31 Feodora Crescent, Narre Warren', 'Renovation'),
      ('Ben Holst', 'Ben.Holst@sportsbet.com.au', NULL, '5 Thanet St, Malvern VIC', 'Project Management')
  ) AS t(display_name, primary_email, primary_phone, project_address, project_type)
), ins AS (
  INSERT INTO public.stakeholders (
    id, company_id, display_name, category, primary_email, primary_phone, status, created_at, notes
  )
  SELECT 
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,
    nc.display_name,
    'client'::stakeholder_category,
    nc.primary_email,
    nc.primary_phone,
    'active'::stakeholder_status,
    now(),
    'Project: ' || nc.project_type || 
    CASE WHEN nc.project_address IS NOT NULL THEN ' | Address: ' || nc.project_address ELSE '' END
  FROM new_clients nc
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stakeholders s
    WHERE s.company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid
      AND lower(s.display_name) = lower(nc.display_name)
      AND lower(COALESCE(s.primary_email, '')) = lower(COALESCE(nc.primary_email, ''))
  )
  RETURNING 1
)
SELECT count(*) AS inserted_count FROM ins;