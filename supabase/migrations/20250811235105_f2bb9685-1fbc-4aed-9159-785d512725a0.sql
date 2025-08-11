-- Add 5.4 FIXING STAGE activities for construction project
-- Insert Fixing Stage activities with their costs

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
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Timber Floor', '', '5.4 FIXING STAGE', 45000.00, 0, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Tile', '', '5.4 FIXING STAGE', 25000.00, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Waterproofing', '', '5.4 FIXING STAGE', 8500.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Tiling Labour', '', '5.4 FIXING STAGE', 35000.00, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Stone Benchtops', '', '5.4 FIXING STAGE', 18000.00, 0, 2, 5),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Stairs', '', '5.4 FIXING STAGE', 16000.00, 0, 2, 6),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Sound Proofing', '', '5.4 FIXING STAGE', 9000.00, 0, 2, 7),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Plumbing Fixtures', '', '5.4 FIXING STAGE', 22000.00, 0, 2, 8),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Plaster', '', '5.4 FIXING STAGE', 28000.00, 0, 2, 9),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Painter', '', '5.4 FIXING STAGE', 35000.00, 0, 2, 10),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Joinery', '', '5.4 FIXING STAGE', 85000.00, 0, 2, 11),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Insulation', '', '5.4 FIXING STAGE', 12000.00, 0, 2, 12),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Hydronic In-Slab Heating', '', '5.4 FIXING STAGE', 55000.00, 0, 2, 13),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fixing Materials', '', '5.4 FIXING STAGE', 8500.00, 0, 2, 14),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fix Carpenter', '', '5.4 FIXING STAGE', 12000.00, 0, 2, 15),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fit Off Carpenter', '', '5.4 FIXING STAGE', 15000.00, 0, 2, 16),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Doors & Frames', '', '5.4 FIXING STAGE', 20000.00, 0, 2, 17),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Door Hardware', '', '5.4 FIXING STAGE', 3500.00, 0, 2, 18),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Driveway', '', '5.4 FIXING STAGE', 8000.00, 0, 2, 19),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Deck', '', '5.4 FIXING STAGE', 25000.00, 0, 2, 20);