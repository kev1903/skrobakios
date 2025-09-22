-- Create user permissions table for module-level access control
CREATE TABLE IF NOT EXISTS public.user_permissions (
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
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user permissions
CREATE POLICY "Company admins can manage user permissions"
ON public.user_permissions
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
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_permissions_updated_at();