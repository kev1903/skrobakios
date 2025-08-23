-- Add new trade stakeholders from the uploaded image
-- First, get the user's active company ID (we'll use a subquery for this)

-- Temporary Site Hire companies
INSERT INTO public.stakeholders (
  company_id, stakeholder_name, stakeholder_type, trade_category, 
  email, phone, address, status, created_at
) 
SELECT 
  cm.company_id,
  stakeholder_data.name,
  'subcontractor'::stakeholder_type,
  stakeholder_data.category,
  stakeholder_data.email,
  stakeholder_data.phone,
  stakeholder_data.address,
  'active'::text,
  now()
FROM company_members cm
CROSS JOIN (VALUES 
  ('Epsom Hire P/L', 'Temporary Site Hire', 'info@epsomhire.com.au', '03 9580 5470', '6-8 Spray Avenue, Mordialloc 3195'),
  ('AIM Site Hire Pty Ltd', 'Temporary Site Hire', 'hiring@aimhire.com.au', '(03) 9720 4455', '14-16 The Nook, Bayswater Victoria 3153'),
  ('Smart Hire', 'Temporary Site Hire', 'hire@carnegierental.com.au', '(03) 9571 9488', '1076 Dandenong Road, Carnegie, VIC 3163'),
  ('Benkel Hire', 'Temporary Site Hire', 'info@benkel.com.au', '(03) 9796 3811', '77 Hallam South Road, Hallam Vic 3803'),
  ('Stegbar', 'Windows and Glazing', 'JRousetty@stegbar.com.au', '+61 3 9765 3500', '949 Stud Rd, Rowville VIC'),
  ('Joey Glass & Aluminium', 'Windows and Glazing', 'joeyglass@live.com.au', '0452 514 709', 'Factory: 4/12-14 Miles St Mulgrave 3170'),
  ('Panoramic Windows & Doors', 'Windows and Glazing', 'admin@hrds.com.au', '03 9303 9343', '53B Metrolink CCT, Campbellfield'),
  ('Ardelle', 'Windows and Glazing', 'Projects@ardelle.com.au', NULL, NULL),
  ('Yokor Windows', 'Windows and Glazing', 'project@yokor.com.au', '03 9543 1686', '2 / 55 Olive Grove, Keysborough, VIC 3173'),
  ('PT Marble', 'Stone', 'sales@ptmarble.com.au', '03 89008023', '48 Williams Road Dandenong South 3175'),
  ('United Stone', 'Stone', 'sales@unitedstonemelbourne.com.au', '03 9791 3720', '169 Greens Road, Dandenong South'),
  ('Kaystone', 'Stone', 'info@kaystone.com.au', '(03) 9793 9344', '30 Sinclair Rd, Dandenong VIC 3175'),
  ('Regal Stone Mason', 'Stone', 'admin@regalstonemason.com.au', '9580 8590', '2 Hall St Braeside VIC 3195')
) AS stakeholder_data(name, category, email, phone, address)
WHERE cm.user_id = auth.uid() 
AND cm.status = 'active'
LIMIT 1;