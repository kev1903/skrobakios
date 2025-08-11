-- Add construction cost data for 5 Thanet project (Frame Stage activities)
-- Project ID: 844f29f2-fff0-43c0-943b-cef8add9e563

INSERT INTO public.activities (
  project_id,
  company_id,
  name,
  description,
  stage,
  cost_est,
  cost_actual,
  status,
  level,
  sort_order
) VALUES 
-- Frame Stage Activities
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Windows', 'Windows and Screens', '5.2 FRAME STAGE', 60000.00, 60000.00, 'Not Started', 1, 1),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Trusses & Frames', NULL, '5.2 FRAME STAGE', 40000.00, 40000.00, 'Not Started', 1, 2),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Frame Carpenter', NULL, '5.2 FRAME STAGE', 24000.00, 24000.00, 'Not Started', 1, 3),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Structural Steel Detailing', NULL, '5.2 FRAME STAGE', 1980.00, 1980.00, 'Not Started', 1, 4),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Structural Steel', NULL, '5.2 FRAME STAGE', 60000.00, 60000.00, 'Not Started', 1, 5),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Skylights', NULL, '5.2 FRAME STAGE', 1800.00, 1800.00, 'Not Started', 1, 6),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Plumbing', NULL, '5.2 FRAME STAGE', 48000.00, 48000.00, 'Not Started', 1, 7),
('844f29f2-fff0-43c0-943b-cef8add9e563', (SELECT get_user_current_company_id()), 'Electrician', NULL, '5.2 FRAME STAGE', 30000.00, 30000.00, 'Not Started', 1, 8);