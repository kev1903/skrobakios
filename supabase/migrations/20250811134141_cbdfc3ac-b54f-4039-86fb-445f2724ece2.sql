-- Insert 4.0 PRELIMINARY activities for project "5 Thanet Street"
-- Baseline copied to both cost_est (Project Budget) and cost_actual (Cost Committed)
DO $$
DECLARE
  v_project_id uuid := '844f29f2-fff0-43c0-943b-cef8add9e563';
  v_company_id uuid := '4042458b-8e95-4842-90d9-29f43815ecf8';
  v_stage text := '4.0 PRELIMINARY';
  v_sort int := 1;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='activities'
  ) THEN
    RAISE EXCEPTION 'Table public.activities not found';
  END IF;

  -- Helper to insert a row
  PERFORM 1; -- no-op

  -- Demolition
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Demolition', NULL, v_stage, 0, 30280, 30280, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Site Feature & Re-establishment Survey
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Site Feature & Re-establishment Survey', NULL, v_stage, 0, 4600, 4600, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Architectural
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Architectural', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Engineering
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Engineering', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Geotechnical Soil Testing
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Geotechnical Soil Testing', NULL, v_stage, 0, 968, 968, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Energy Report
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Energy Report', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Performance Solution Report
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Performance Solution Report', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Civil Drainage Design
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Civil Drainage Design', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Roof Drainage Design
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Roof Drainage Design', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Interior Designer / Interior Documentation
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Interior Designer / Interior Documentation', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Landscape Designer / Architect
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Landscape Designer / Architect', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Project Estimate
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Project Estimate', NULL, v_stage, 0, 1800, 1800, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Building Surveying
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Building Surveying', NULL, v_stage, 0, 8100, 8100, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Domestic Building Insurance
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Domestic Building Insurance', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Work Protection Insurance
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Work Protection Insurance', NULL, v_stage, 0, 605, 605, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Construction Management Services
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Construction Management Services', NULL, v_stage, 0, 70000, 70000, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Builders License
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Builders License', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- 3D Renders / Virtual Design Models
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, '3D Renders / Virtual Design Models', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- Asset Protection
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'Asset Protection', NULL, v_stage, 0, 0, 0, true, v_sort, '{}');
  v_sort := v_sort + 1;

  -- CONTINGENCY (5%)
  INSERT INTO public.activities (project_id, company_id, name, description, stage, level, cost_est, cost_actual, is_expanded, sort_order, dependencies)
  VALUES (v_project_id, v_company_id, 'CONTINGENCY', '5%', v_stage, 0, 60000, 60000, true, v_sort, '{}');
END $$;