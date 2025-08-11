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
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Timber Floor Supply', '90m2 @ $80/m2', '5.4 FIXING STAGE', 7200.00, 0, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Timber Floor Installation', '90m2 @ 45/m2', '5.4 FIXING STAGE', 4050.00, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Floor Tile Supply', '21m2 @ 45', '5.4 FIXING STAGE', 945.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Wall Tile Supply', '88m2', '5.4 FIXING STAGE', 3960.00, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Waterproofing', '', '5.4 FIXING STAGE', 5000.00, 0, 2, 5),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Tiling Labour', '', '5.4 FIXING STAGE', 15000.00, 0, 2, 6),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Stone Benchtops', 'Supply & Install', '5.4 FIXING STAGE', 42000.00, 0, 2, 7),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Stairs', '', '5.4 FIXING STAGE', 7000.00, 0, 2, 8),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Sound Proofing', '', '5.4 FIXING STAGE', 3000.00, 0, 2, 9),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Plumbing Fixtures', '', '5.4 FIXING STAGE', 6000.00, 0, 2, 10),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Plaster', '', '5.4 FIXING STAGE', 45000.00, 0, 2, 11),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Painter', '', '5.4 FIXING STAGE', 45000.00, 0, 2, 12),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Joinery', '', '5.4 FIXING STAGE', 65000.00, 0, 2, 13),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Insulation', '', '5.4 FIXING STAGE', 8000.00, 0, 2, 14),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Hydronic In-Slab Heating', '', '5.4 FIXING STAGE', 55000.00, 37000.00, 2, 15),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fixing Materials', '', '5.4 FIXING STAGE', 12000.00, 0, 2, 16),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fix Carpenter', '', '5.4 FIXING STAGE', 4500.00, 0, 2, 17),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Fit Off Carpenter', '', '5.4 FIXING STAGE', 3000.00, 0, 2, 18),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Doors & Frames', '', '5.4 FIXING STAGE', 8000.00, 0, 2, 19),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Door Hardware', '', '5.4 FIXING STAGE', 6000.00, 0, 2, 20);