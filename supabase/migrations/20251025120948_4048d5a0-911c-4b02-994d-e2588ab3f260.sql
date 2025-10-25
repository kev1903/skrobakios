-- Insert the task and cost items under Exterior Works that SkAi described but didn't create
-- First, get the Exterior Works parent ID
DO $$
DECLARE
  exterior_works_id uuid;
  project_id_val uuid := '5fa842cd-60a0-47a9-b714-0752117c77d2';
  company_id_val uuid;
  task1_id uuid;
  task2_id uuid;
  task3_id uuid;
  task4_id uuid;
BEGIN
  -- Get the Exterior Works ID
  SELECT id INTO exterior_works_id 
  FROM wbs_items 
  WHERE project_id = project_id_val AND wbs_id = '3';
  
  -- Get company_id from the parent item
  SELECT company_id INTO company_id_val
  FROM wbs_items
  WHERE id = exterior_works_id;

  -- Task 1: Scaffolding Hire (Level 2)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, exterior_works_id, '3.1', 'Scaffolding Hire', 
    2, 'Task', 'Not Started', 0, true, 0, 0, null, 1
  ) RETURNING id INTO task1_id;

  -- Cost Item under Task 1 (Level 3)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, task1_id, '3.1.1', 'Scaffolding Hire Around The House', 
    3, 'Element', 'Not Started', 0, true, 6500, 0, null, 1
  );

  -- Task 2: Build Out 4 Columns (Level 2)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, exterior_works_id, '3.2', 'Build Out 4 Columns', 
    2, 'Task', 'Not Started', 0, true, 0, 0, null, 2
  ) RETURNING id INTO task2_id;

  -- Cost Item under Task 2 (Level 3)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, task2_id, '3.2.1', 'Build Out 4 Columns', 
    3, 'Element', 'Not Started', 0, true, 2340, 0, null, 1
  );

  -- Task 3: Entire House Render (Level 2)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, exterior_works_id, '3.3', 'Entire House Render', 
    2, 'Task', 'Not Started', 0, true, 0, 0, null, 3
  ) RETURNING id INTO task3_id;

  -- Cost Item under Task 3 (Level 3)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, task3_id, '3.3.1', 'Entire House Render', 
    3, 'Element', 'Not Started', 0, true, 37349, 0, null, 1
  );

  -- Task 4: Facade Moulding (Level 2)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, exterior_works_id, '3.4', 'Facade Moulding', 
    2, 'Task', 'Not Started', 0, true, 0, 0, null, 4
  ) RETURNING id INTO task4_id;

  -- Cost Item under Task 4 (Level 3)
  INSERT INTO wbs_items (
    company_id, project_id, parent_id, wbs_id, title, level, category,
    status, progress, is_expanded, budgeted_cost, actual_cost,
    assigned_to, sort_order
  ) VALUES (
    company_id_val, project_id_val, task4_id, '3.4.1', 'Facade Moulding', 
    3, 'Element', 'Not Started', 0, true, 19630, 0, null, 1
  );

END $$;