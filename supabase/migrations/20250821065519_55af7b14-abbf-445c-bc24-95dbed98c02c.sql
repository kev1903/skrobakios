-- Create platform permissions table to define available permissions
CREATE TABLE public.platform_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create user permissions table for company-specific permissions
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id, permission_key)
);

-- Create company permission settings table
CREATE TABLE public.company_permission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  configured_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, permission_key)
);

-- Enable RLS on all tables
ALTER TABLE public.platform_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_permission_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_permissions
CREATE POLICY "Superadmins can manage platform permissions"
ON public.platform_permissions
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'superadmin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'superadmin'
));

CREATE POLICY "Authenticated users can view active platform permissions"
ON public.platform_permissions
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS Policies for user_permissions
CREATE POLICY "Users can view permissions in their companies"
ON public.user_permissions
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Company admins can manage user permissions"
ON public.user_permissions
FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

-- RLS Policies for company_permission_settings
CREATE POLICY "Company admins can manage company permission settings"
ON public.company_permission_settings
FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  )
);

CREATE POLICY "Company members can view company permission settings"
ON public.company_permission_settings
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM public.company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- Insert default platform permissions
INSERT INTO public.platform_permissions (permission_key, name, description, category) VALUES
-- Platform Permissions
('manage_platform_users', 'Manage Platform Users', 'Create, edit, and delete platform users', 'Platform Permissions'),
('manage_platform_roles', 'Manage Platform Roles', 'Assign and modify platform-level roles', 'Platform Permissions'),
('view_platform_analytics', 'View Platform Analytics', 'Access platform-wide usage and performance data', 'Platform Permissions'),
('manage_system_settings', 'Manage System Settings', 'Configure global platform settings', 'Platform Permissions'),
('view_all_companies', 'View All Companies', 'Access information for all companies on platform', 'Platform Permissions'),

-- Company Permissions
('manage_company_users', 'Manage Company Users', 'Add, edit, and remove company members', 'Company Permissions'),
('manage_company_settings', 'Manage Company Settings', 'Configure company-specific settings', 'Company Permissions'),
('view_company_analytics', 'View Company Analytics', 'Access company usage and performance data', 'Company Permissions'),
('manage_company_projects', 'Manage Company Projects', 'Create, edit, and delete company projects', 'Company Permissions'),

-- Project Permissions
('view_projects', 'View Projects', 'Access and view project information', 'Project Permissions'),
('manage_projects', 'Manage Projects', 'Create, edit, and delete projects', 'Project Permissions'),
('manage_tasks', 'Manage Tasks', 'Create, edit, and delete project tasks', 'Project Permissions'),
('view_project_financials', 'View Project Financials', 'Access project cost and budget information', 'Project Permissions'),
('manage_project_files', 'Manage Project Files', 'Upload, organize, and manage project files', 'Project Permissions'),

-- General Permissions
('view_dashboard', 'View Dashboard', 'Access the main dashboard', 'General Permissions'),
('export_data', 'Export Data', 'Export data to various formats', 'General Permissions'),
('view_reports', 'View Reports', 'Access and generate reports', 'General Permissions');

-- Function to get user permissions for a specific company
CREATE OR REPLACE FUNCTION public.get_user_permissions_for_company(
  target_user_id UUID,
  target_company_id UUID
)
RETURNS TABLE(
  permission_key TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  granted BOOLEAN,
  is_available BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.permission_key,
    pp.name,
    pp.description,
    pp.category,
    COALESCE(up.granted, false) as granted,
    COALESCE(cps.is_enabled, true) as is_available
  FROM public.platform_permissions pp
  LEFT JOIN public.user_permissions up ON (
    pp.permission_key = up.permission_key 
    AND up.user_id = target_user_id 
    AND up.company_id = target_company_id
  )
  LEFT JOIN public.company_permission_settings cps ON (
    pp.permission_key = cps.permission_key 
    AND cps.company_id = target_company_id
  )
  WHERE pp.is_active = true
  AND (cps.is_enabled IS NULL OR cps.is_enabled = true)
  ORDER BY pp.category, pp.name;
END;
$$;

-- Function to set user permissions
CREATE OR REPLACE FUNCTION public.set_user_permissions(
  target_user_id UUID,
  target_company_id UUID,
  permissions_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  permission_item JSONB;
  result JSON;
BEGIN
  -- Check if requesting user can manage permissions for this company
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = target_company_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('owner', 'admin')
    AND cm.status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Process each permission
  FOR permission_item IN SELECT * FROM jsonb_array_elements(permissions_data)
  LOOP
    INSERT INTO public.user_permissions (
      user_id,
      company_id,
      permission_key,
      granted,
      granted_by,
      granted_at
    ) VALUES (
      target_user_id,
      target_company_id,
      permission_item->>'permission_key',
      (permission_item->>'granted')::boolean,
      auth.uid(),
      now()
    )
    ON CONFLICT (user_id, company_id, permission_key)
    DO UPDATE SET
      granted = EXCLUDED.granted,
      granted_by = EXCLUDED.granted_by,
      granted_at = EXCLUDED.granted_at,
      updated_at = now();
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'Permissions updated successfully');
END;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  target_user_id UUID,
  target_company_id UUID,
  permission_key_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if permission is enabled for company and granted to user
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    JOIN public.platform_permissions pp ON pp.permission_key = up.permission_key
    LEFT JOIN public.company_permission_settings cps ON (
      cps.permission_key = up.permission_key 
      AND cps.company_id = up.company_id
    )
    WHERE up.user_id = target_user_id
    AND up.company_id = target_company_id
    AND up.permission_key = permission_key_param
    AND up.granted = true
    AND pp.is_active = true
    AND (cps.is_enabled IS NULL OR cps.is_enabled = true)
  );
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_platform_permissions_updated_at
  BEFORE UPDATE ON public.platform_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_permission_settings_updated_at
  BEFORE UPDATE ON public.company_permission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();