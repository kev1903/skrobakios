-- Add stakeholders from the uploaded contractor list (corrected column names)
INSERT INTO public.stakeholders (
  company_id,
  company_name,
  stakeholder_type,
  trade_category,
  contact_email,
  contact_phone,
  location,
  status,
  created_at,
  updated_at
) VALUES 
-- Electrical
(
  public.get_user_current_company_id(),
  'Toma Power Solutions',
  'contractor',
  'Electrical',
  'info@tomapowersolutions.com',
  '1300 728 196',
  '27/48 Lindon Ct, Tullamarine VIC',
  'active',
  now(),
  now()
),

-- Plumbing
(
  public.get_user_current_company_id(),
  'Intuitive Plumbing',
  'contractor',
  'Plumbing',
  'accounts@intuitiveplumbing.com.au',
  null,
  null,
  'active',
  now(),
  now()
),
(
  public.get_user_current_company_id(),
  'J & G Plumbing Solutions',
  'contractor',
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
  public.get_user_current_company_id(),
  'Kooka',
  'contractor',
  'HVAC',
  'kookatpl@bigpond.com',
  '03 8790 3450',
  'Fountain Gate VIC',
  'active',
  now(),
  now()
),
(
  public.get_user_current_company_id(),
  'Executive Heating & Cooling',
  'contractor',
  'HVAC',
  'sales@executiveheatcool.com.au',
  '9702-4224',
  'Hallam VIC',
  'active',
  now(),
  now()
),
(
  public.get_user_current_company_id(),
  'TBS Services Group',
  'contractor',
  'HVAC',
  'chris@tbsservices.com.au',
  '1800 827 247',
  '2/64 Bridge Road, Keysborough VIC 3173',
  'active',
  now(),
  now()
),

-- Framing Carpenter
(
  public.get_user_current_company_id(),
  'Jay Conrad',
  'contractor',
  'Framing Carpenter',
  'jayconrad@y7mail.com',
  null,
  null,
  'active',
  now(),
  now()
),
(
  public.get_user_current_company_id(),
  'By Built',
  'contractor',
  'Framing Carpenter',
  'info@bybuilt.com.au',
  null,
  null,
  'active',
  now(),
  now()
);