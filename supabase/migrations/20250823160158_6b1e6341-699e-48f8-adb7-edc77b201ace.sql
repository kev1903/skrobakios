-- Add stakeholders from the uploaded contractor list (using specific company ID)
INSERT INTO public.stakeholders (
  company_id,
  display_name,
  category,
  trade_industry,
  primary_email,
  primary_phone,
  notes,
  status,
  created_at,
  updated_at
) VALUES 
-- Electrical
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'Toma Power Solutions',
  'trade',
  'Electrical',
  'info@tomapowersolutions.com',
  '1300 728 196',
  'Address: 27/48 Lindon Ct, Tullamarine VIC',
  'active',
  now(),
  now()
),

-- Plumbing
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'Intuitive Plumbing',
  'trade',
  'Plumbing',
  'accounts@intuitiveplumbing.com.au',
  null,
  null,
  'active',
  now(),
  now()
),
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'J & G Plumbing Solutions',
  'trade',
  'Plumbing',
  'contact@jandgplumbing.com.au',
  null,
  null,
  'active',
  now(),
  now()
),

-- HVAC
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'Kooka',
  'trade',
  'HVAC',
  'kookatpl@bigpond.com',
  '03 8790 3450',
  'Location: Fountain Gate VIC',
  'active',
  now(),
  now()
),
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'Executive Heating & Cooling',
  'trade',
  'HVAC',
  'sales@executiveheatcool.com.au',
  '9702-4224',
  'Location: Hallam VIC',
  'active',
  now(),
  now()
),
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'TBS Services Group',
  'trade',
  'HVAC',
  'chris@tbsservices.com.au',
  '1800 827 247',
  'Address: 2/64 Bridge Road, Keysborough VIC 3173',
  'active',
  now(),
  now()
),

-- Framing Carpenter
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'Jay Conrad',
  'trade',
  'Framing Carpenter',
  'jayconrad@y7mail.com',
  null,
  null,
  'active',
  now(),
  now()
),
(
  'df0df659-7e4c-41c4-a028-495539a0b556',
  'By Built',
  'trade',
  'Framing Carpenter',
  'info@bybuilt.com.au',
  null,
  null,
  'active',
  now(),
  now()
);