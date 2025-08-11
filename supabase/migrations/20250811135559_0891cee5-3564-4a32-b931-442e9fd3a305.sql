-- Insert 4.1 PRE-CONSTRUCTION and 5.1 BASE STAGE activities for project "5 Thanet Street"
DO $$
DECLARE
  v_project_id uuid := '844f29f2-fff0-43c0-943b-cef8add9e563';
  v_company_id uuid := '4042458b-8e95-4842-90d9-29f43815ecf8';
BEGIN
  -- 4.1 PRE-CONSTRUCTION
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Underground Power', NULL, '4.1 PRE-CONSTRUCTION', 0, true, 1, 9000, 9000
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '4.1 PRE-CONSTRUCTION' AND a.name = 'Underground Power'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Site Hoarding', NULL, '4.1 PRE-CONSTRUCTION', 0, true, 2, 3500, 3500
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '4.1 PRE-CONSTRUCTION' AND a.name = 'Site Hoarding'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Fence Hire', NULL, '4.1 PRE-CONSTRUCTION', 0, true, 3, 500, 500
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '4.1 PRE-CONSTRUCTION' AND a.name = 'Fence Hire'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'PIC Application', NULL, '4.1 PRE-CONSTRUCTION', 0, true, 4, 100, 100
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '4.1 PRE-CONSTRUCTION' AND a.name = 'PIC Application'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Dilapidation Report', NULL, '4.1 PRE-CONSTRUCTION', 0, true, 5, 800, 800
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '4.1 PRE-CONSTRUCTION' AND a.name = 'Dilapidation Report'
  );

  -- 5.1 BASE STAGE
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Excavation', 'Included in Slab Cost', '5.1 BASE STAGE', 0, true, 1, 0, 0
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Excavation'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Slab', NULL, '5.1 BASE STAGE', 0, true, 2, 110000, 110000
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Slab'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Site Clean', '4 Site Clean', '5.1 BASE STAGE', 0, true, 3, 6600, 6600
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Site Clean'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Set Out', NULL, '5.1 BASE STAGE', 0, true, 4, 400, 400
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Set Out'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Protection Works', NULL, '5.1 BASE STAGE', 0, true, 5, 1200, 1200
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Protection Works'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Planter Boxes', NULL, '5.1 BASE STAGE', 0, true, 6, 3800, 3800
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Planter Boxes'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Pest Control Part A', NULL, '5.1 BASE STAGE', 0, true, 7, 1200, 1200
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Pest Control Part A'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Fence Painting', NULL, '5.1 BASE STAGE', 0, true, 8, 800, 800
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Fence Painting'
  );

  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, is_expanded, sort_order, cost_est, cost_actual)
  SELECT v_project_id, v_company_id, 'Fence - Rear', 'At the back', '5.1 BASE STAGE', 0, true, 9, 500, 500
  WHERE NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.project_id = v_project_id AND a.stage = '5.1 BASE STAGE' AND a.name = 'Fence - Rear'
  );
END $$;