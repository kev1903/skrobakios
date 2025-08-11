-- Add 5.3 LOCKUP STAGE activities for construction project
-- Insert Lockup Stage activities with their costs

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
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Solar Panels', '', '5.3 LOCKUP STAGE', 30000.00, 22564.00, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Sisalation Paper', '', '5.3 LOCKUP STAGE', 7000.00, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Security / Intercom / CCTV', '', '5.3 LOCKUP STAGE', 4500.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Screens, Louvres & Awnings', '', '5.3 LOCKUP STAGE', 0, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Scaffolding', '', '5.3 LOCKUP STAGE', 18000.00, 12997.39, 2, 5),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Roof Rails', '', '5.3 LOCKUP STAGE', 3000.00, 0, 2, 6),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Metal Roof', '', '5.3 LOCKUP STAGE', 50000.00, 40205.00, 2, 7),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Mechanical services (HVAC)', '', '5.3 LOCKUP STAGE', 45000.00, 0, 2, 8),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Lock up Material', '', '5.3 LOCKUP STAGE', 3500.00, 0, 2, 9),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Lock up Carpenter', '', '5.3 LOCKUP STAGE', 8000.00, 0, 2, 10),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Home Automation', '', '5.3 LOCKUP STAGE', 8000.00, 0, 2, 11),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Brick Supply', '12,000 Krausse Bricks', '5.3 LOCKUP STAGE', 40000.00, 0, 2, 12),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Brick Supply', '1,000 Krausse Bricks', '5.3 LOCKUP STAGE', 2800.00, 0, 2, 13),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Brick - Sand & Cement', '', '5.3 LOCKUP STAGE', 3500.00, 0, 2, 14),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Bricklaying Labour', '', '5.3 LOCKUP STAGE', 25000.00, 0, 2, 15),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Brick Clean', '', '5.3 LOCKUP STAGE', 2200.00, 0, 2, 16),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Hebel Cladding', 'Including Supply, Installation', '5.3 LOCKUP STAGE', 15400.00, 0, 2, 17),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'James Hardie Cladding', '', '5.3 LOCKUP STAGE', 9500.00, 0, 2, 18);