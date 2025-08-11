-- Add 5.5 FINALS STAGE activities for construction project
-- Insert Finals Stage activities with their costs

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
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Window Furnishing', '', '5.5 FINALS STAGE', 30000.00, 0, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Splashback', 'Included in Stone/Tile', '5.5 FINALS STAGE', 0, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Showers & Mirrors', '', '5.5 FINALS STAGE', 5500.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Pest Control; Part B', '', '5.5 FINALS STAGE', 1500.00, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Garage Door', '', '5.5 FINALS STAGE', 2300.00, 0, 2, 5),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Caulking', '', '5.5 FINALS STAGE', 8000.00, 0, 2, 6),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Carpet Floor coverings', '96 m2', '5.5 FINALS STAGE', 12000.00, 10010.00, 2, 7),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Builders Clean', '', '5.5 FINALS STAGE', 3500.00, 0, 2, 8),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Appliances', '', '5.5 FINALS STAGE', 15000.00, 0, 2, 9);