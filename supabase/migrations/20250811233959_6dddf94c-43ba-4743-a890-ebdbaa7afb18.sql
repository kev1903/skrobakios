-- Add construction cost data for 5 Thanet project (Frame Stage activities)
-- Project ID: 844f29f2-fff0-43c0-943b-cef8add9e563
-- Using Courtscapes company ID: df0df659-7e4c-41c4-a028-495539a0b556

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
-- Frame Stage Activities
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Windows', 'Windows and Screens', '5.2 FRAME STAGE', 60000.00, 60000.00, 1, 1),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Trusses & Frames', NULL, '5.2 FRAME STAGE', 40000.00, 40000.00, 1, 2),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Frame Carpenter', NULL, '5.2 FRAME STAGE', 24000.00, 24000.00, 1, 3),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Structural Steel Detailing', NULL, '5.2 FRAME STAGE', 1980.00, 1980.00, 1, 4),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Structural Steel', NULL, '5.2 FRAME STAGE', 60000.00, 60000.00, 1, 5),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Skylights', NULL, '5.2 FRAME STAGE', 1800.00, 1800.00, 1, 6),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Plumbing', NULL, '5.2 FRAME STAGE', 48000.00, 48000.00, 1, 7),
('844f29f2-fff0-43c0-943b-cef8add9e563', 'df0df659-7e4c-41c4-a028-495539a0b556', 'Electrician', NULL, '5.2 FRAME STAGE', 30000.00, 30000.00, 1, 8);