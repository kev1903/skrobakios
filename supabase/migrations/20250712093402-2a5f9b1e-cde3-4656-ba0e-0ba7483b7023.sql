-- Data Isolation Migration: Ensure all existing data belongs to Skrobaki company and fix company scoping

-- First, get the Skrobaki company ID (assuming it exists)
DO $$ 
DECLARE
    skrobaki_company_id UUID;
BEGIN
    -- Find the Skrobaki company ID
    SELECT id INTO skrobaki_company_id
    FROM companies 
    WHERE LOWER(name) LIKE '%skrobaki%' 
    LIMIT 1;
    
    -- If no Skrobaki company found, create one
    IF skrobaki_company_id IS NULL THEN
        INSERT INTO companies (name, slug, created_by)
        VALUES ('Skrobaki', 'skrobaki', (SELECT id FROM auth.users LIMIT 1))
        RETURNING id INTO skrobaki_company_id;
        
        -- Add the first user as owner of Skrobaki company
        INSERT INTO company_members (company_id, user_id, role, status)
        SELECT skrobaki_company_id, id, 'owner', 'active'
        FROM auth.users 
        LIMIT 1;
    END IF;
    
    -- Update projects that don't have company_id set to Skrobaki
    UPDATE projects 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    -- Update digital_objects that don't have company_id set to Skrobaki
    UPDATE digital_objects 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    -- Update leads that don't have company_id set to Skrobaki
    UPDATE leads 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    -- Update estimates that don't have company_id set to Skrobaki
    UPDATE estimates 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    -- Update time_entries that don't have company_id set to Skrobaki
    UPDATE time_entries 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    -- Update wbs_items that don't have company_id set to Skrobaki
    UPDATE wbs_items 
    SET company_id = skrobaki_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Updated all existing data to belong to Skrobaki company: %', skrobaki_company_id;
END $$;

-- Make company_id NOT NULL for key tables to enforce data isolation
ALTER TABLE projects ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE digital_objects ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE leads ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE estimates ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE wbs_items ALTER COLUMN company_id SET NOT NULL;

-- Update RLS policies to enforce company-level data isolation

-- Digital Objects: Only show objects from user's companies
DROP POLICY IF EXISTS "Authenticated users can view digital objects" ON digital_objects;
DROP POLICY IF EXISTS "Authenticated users can manage digital objects" ON digital_objects;
DROP POLICY IF EXISTS "Authenticated users can create digital objects" ON digital_objects;
DROP POLICY IF EXISTS "Authenticated users can update digital objects" ON digital_objects;

CREATE POLICY "Users can view digital objects from their companies" 
ON digital_objects 
FOR SELECT 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create digital objects in their companies" 
ON digital_objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update digital objects in their companies" 
ON digital_objects 
FOR UPDATE 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete digital objects in their companies" 
ON digital_objects 
FOR DELETE 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Projects: Update policies to be more restrictive
DROP POLICY IF EXISTS "Users can manage projects in their companies" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;

CREATE POLICY "Users can view projects from their companies" 
ON projects 
FOR SELECT 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage projects in their companies" 
ON projects 
FOR ALL 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Tasks: Add company-based filtering through projects
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON tasks;

CREATE POLICY "Users can view tasks from their company projects" 
ON tasks 
FOR SELECT 
TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage tasks in their company projects" 
ON tasks 
FOR ALL 
TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Subtasks: Filter through parent tasks
DROP POLICY IF EXISTS "Authenticated users can view subtasks" ON subtasks;
DROP POLICY IF EXISTS "Authenticated users can manage subtasks" ON subtasks;

CREATE POLICY "Users can view subtasks from their company projects" 
ON subtasks 
FOR SELECT 
TO authenticated
USING (
  parent_task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage subtasks in their company projects" 
ON subtasks 
FOR ALL 
TO authenticated
USING (
  parent_task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  parent_task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Task Activity Log: Filter through tasks
DROP POLICY IF EXISTS "Anyone can view task activity log" ON task_activity_log;
DROP POLICY IF EXISTS "Anyone can create task activity log" ON task_activity_log;

CREATE POLICY "Users can view task activity from their company projects" 
ON task_activity_log 
FOR SELECT 
TO authenticated
USING (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create task activity in their company projects" 
ON task_activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Task Comments: Filter through tasks
DROP POLICY IF EXISTS "Authenticated users can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Authenticated users can manage task comments" ON task_comments;
DROP POLICY IF EXISTS "Authenticated users can create task comments" ON task_comments;
DROP POLICY IF EXISTS "Users can update their own task comments" ON task_comments;

CREATE POLICY "Users can view task comments from their company projects" 
ON task_comments 
FOR SELECT 
TO authenticated
USING (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage task comments in their company projects" 
ON task_comments 
FOR ALL 
TO authenticated
USING (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Task Attachments: Filter through tasks
DROP POLICY IF EXISTS "Authenticated users can view task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Authenticated users can manage task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Authenticated users can create task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Users can update their own task attachments" ON task_attachments;

CREATE POLICY "Users can view task attachments from their company projects" 
ON task_attachments 
FOR SELECT 
TO authenticated
USING (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage task attachments in their company projects" 
ON task_attachments 
FOR ALL 
TO authenticated
USING (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  task_id IN (
    SELECT t.id 
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN company_members cm ON p.company_id = cm.company_id
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Update remaining policies for other tables
DROP POLICY IF EXISTS "Users can manage leads in their companies" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;

CREATE POLICY "Users can view leads from their companies" 
ON leads 
FOR SELECT 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage leads in their companies" 
ON leads 
FOR ALL 
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Create a function to automatically set company_id when creating new records
CREATE OR REPLACE FUNCTION public.get_user_current_company_id()
RETURNS UUID AS $$
BEGIN
  -- Get the first active company for the user
  -- In practice, this should be enhanced to get the user's currently selected company
  RETURN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;