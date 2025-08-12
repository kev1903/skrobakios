-- Delete existing Fix Stage activities and replace with new ones
-- First, delete all existing activities in stage '4.6 FIX'
DELETE FROM public.activities 
WHERE stage = '4.6 FIX' 
AND project_id = '844f29f2-fff0-43c0-943b-cef8add9e563';

-- Insert new Fix Stage activities based on the provided image
INSERT INTO public.activities (
  project_id,
  company_id,
  name,
  description,
  stage,
  cost_est,
  cost_actual,
  level,
  sort_order
) VALUES
  -- Project: 5 Thanet, Company: 4042458b-8e95-4842-90d9-29f43815ecf8
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Internal Door Handles', '', '4.6 FIX', 1500.00, 0, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Internal Door Stops', '', '4.6 FIX', 500.00, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Window Locks', '', '4.6 FIX', 800.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Window Winders', '', '4.6 FIX', 1200.00, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Window Screens', '', '4.6 FIX', 3500.00, 0, 2, 5),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Mirrors', '', '4.6 FIX', 1500.00, 0, 2, 6),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Shower Screens', '', '4.6 FIX', 4000.00, 0, 2, 7),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Toilet Roll Holders', '', '4.6 FIX', 500.00, 0, 2, 8),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Towel Rails', '', '4.6 FIX', 800.00, 0, 2, 9),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Bathroom Accessories', '', '4.6 FIX', 1200.00, 0, 2, 10),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Clothes Line', '', '4.6 FIX', 800.00, 0, 2, 11),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Garage Door Remote', '', '4.6 FIX', 500.00, 0, 2, 12),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Touch Up Paint', '', '4.6 FIX', 1000.00, 0, 2, 13);