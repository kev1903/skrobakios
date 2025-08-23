-- Add new trade stakeholders from the uploaded image
-- Using correct column names from actual table structure

INSERT INTO public.stakeholders (
  company_id, display_name, category, trade_industry, 
  primary_email, primary_phone, status, created_at
) 
SELECT 
  cm.company_id,
  stakeholder_data.name,
  'subcontractor'::stakeholder_category,
  stakeholder_data.trade_category,
  stakeholder_data.email,
  stakeholder_data.phone,
  'active'::stakeholder_status,
  now()
FROM company_members cm
CROSS JOIN (VALUES 
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
) AS stakeholder_data(name, trade_category, email, phone)
WHERE cm.user_id = auth.uid() 
AND cm.status = 'active'
LIMIT 1;