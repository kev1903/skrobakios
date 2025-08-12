-- Add Handover & Close-Out stage activities
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
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Perform final walk-through inspection', '', '6.0 HANDOVER & CLOSE-OUT', 0.00, 0, 2, 1),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Maintenance Manuals & Warranties', '', '6.0 HANDOVER & CLOSE-OUT', 250.00, 0, 2, 2),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Final read for gas, water and electricity', '', '6.0 HANDOVER & CLOSE-OUT', 0.00, 0, 2, 3),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Complete punch list items', '', '6.0 HANDOVER & CLOSE-OUT', 3000.00, 0, 2, 4),
  ('844f29f2-fff0-43c0-943b-cef8add9e563', '4042458b-8e95-4842-90d9-29f43815ecf8', 'Complete final inspection for certificate of occupancy', '', '6.0 HANDOVER & CLOSE-OUT', 0.00, 0, 2, 5);