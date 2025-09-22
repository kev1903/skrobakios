-- Create user module permissions table for module-level access control
CREATE TABLE IF NOT EXISTS public.user_module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  sub_module_id TEXT,
  access_level TEXT NOT NULL CHECK (access_level IN ('no_access', 'can_view', 'can_edit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, company_id, module_id, sub_module_id)
);

-- Enable RLS
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user module permissions
CREATE POLICY "Company admins can manage user module permissions"
ON public.user_module_permissions
FOR ALL
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

-- Create policy for users to view their own permissions
CREATE POLICY "Users can view their own module permissions"
ON public.user_module_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Update the RPC function to use the new table
CREATE OR REPLACE FUNCTION public.handle_user_permission_upsert(
  p_user_id UUID,
  p_company_id UUID,
  p_module_id TEXT,
  p_sub_module_id TEXT,
  p_access_level TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the permission in the new table
  INSERT INTO public.user_module_permissions (
    user_id, 
    company_id, 
    module_id, 
    sub_module_id, 
    access_level,
    created_by,
    updated_by
  )
  VALUES (
    p_user_id, 
    p_company_id, 
    p_module_id, 
    p_sub_module_id, 
    p_access_level,
    auth.uid(),
    auth.uid()
  )
  ON CONFLICT (user_id, company_id, module_id, sub_module_id)
  DO UPDATE SET
    access_level = EXCLUDED.access_level,
    updated_at = now(),
    updated_by = auth.uid();
END;
$$;