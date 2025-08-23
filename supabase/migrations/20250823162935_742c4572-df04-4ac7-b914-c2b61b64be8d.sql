-- Insert 13 trade stakeholders for the active company (4042458b-8e95-4842-90d9-29f43815ecf8)
-- Idempotent: only insert if a stakeholder with same display_name doesn't already exist for this company
WITH new_rows AS (
  SELECT * FROM (
    VALUES 
      ('Epsom Hire P/L', 'Temporary Site Hire', 'info@epsomhire.com.au', '03 9580 5470'),
      ('AIM Site Hire Pty Ltd', 'Temporary Site Hire', 'hiring@aimhire.com.au', '(03) 9720 4455'),
      ('Smart Hire', 'Temporary Site Hire', 'hire@carnegierental.com.au', '(03) 9571 9488'),
      ('Benkel Hire', 'Temporary Site Hire', 'info@benkel.com.au', '(03) 9796 3811'),
      ('Stegbar', 'Windows and Glazing', 'JRousetty@stegbar.com.au', '+61 3 9765 3500'),
      ('Joey Glass & Aluminium', 'Windows and Glazing', 'joeyglass@live.com.au', '0452 514 709'),
      ('Panoramic Windows & Doors', 'Windows and Glazing', 'admin@hrds.com.au', '03 9303 9343'),
      ('Ardelle', 'Windows and Glazing', 'Projects@ardelle.com.au', NULL),
      ('Yokor Windows', 'Windows and Glazing', 'project@yokor.com.au', '03 9543 1686'),
      ('PT Marble', 'Stone', 'sales@ptmarble.com.au', '03 89008023'),
      ('United Stone', 'Stone', 'sales@unitedstonemelbourne.com.au', '03 9791 3720'),
      ('Kaystone', 'Stone', 'info@kaystone.com.au', '(03) 9793 9344'),
      ('Regal Stone Mason', 'Stone', 'admin@regalstonemason.com.au', '9580 8590')
  ) AS t(display_name, trade_industry, primary_email, primary_phone)
), ins AS (
  INSERT INTO public.stakeholders (
    id, company_id, display_name, category, trade_industry, primary_email, primary_phone, status, created_at
  )
  SELECT 
    gen_random_uuid(),
    '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid,
    nr.display_name,
    'trade'::stakeholder_category,
    nr.trade_industry,
    nr.primary_email,
    nr.primary_phone,
    'active'::stakeholder_status,
    now()
  FROM new_rows nr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stakeholders s
    WHERE s.company_id = '4042458b-8e95-4842-90d9-29f43815ecf8'::uuid
      AND lower(s.display_name) = lower(nr.display_name)
  )
  RETURNING 1
)
SELECT count(*) AS inserted_count FROM ins;