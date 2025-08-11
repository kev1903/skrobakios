-- Phase 1: Fix Critical Data Exposure Issues

-- 1. Secure xero_invoices table - remove public access and restrict to user's own data
DROP POLICY IF EXISTS "Anyone can view Xero invoices" ON public.xero_invoices;

CREATE POLICY "Users can view their own Xero invoices" 
ON public.xero_invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Xero invoices" 
ON public.xero_invoices 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Secure estimates table - restrict to company members only
DROP POLICY IF EXISTS "Anyone can view estimates" ON public.estimates;

CREATE POLICY "Company members can view estimates" 
ON public.estimates 
FOR SELECT 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

CREATE POLICY "Company members can manage estimates" 
ON public.estimates 
FOR ALL 
USING (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
))
WITH CHECK (company_id IN (
  SELECT cm.company_id 
  FROM company_members cm 
  WHERE cm.user_id = auth.uid() 
  AND cm.status = 'active'
));

-- 3. Secure wbs_items table - restrict to project members and company admins
DROP POLICY IF EXISTS "Authenticated users can view WBS items" ON public.wbs_items;
DROP POLICY IF EXISTS "Authenticated users can manage WBS items" ON public.wbs_items;

CREATE POLICY "Project members can view WBS items" 
ON public.wbs_items 
FOR SELECT 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Project members can manage WBS items" 
ON public.wbs_items 
FOR ALL 
USING (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT pm.project_id 
    FROM project_members pm 
    WHERE pm.user_id = auth.uid() 
    AND pm.status = 'active'
  ) 
  OR company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin') 
    AND cm.status = 'active'
  )
);

-- 4. Fix critical database functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_project_member(target_project_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = target_user_id
      and pm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_member_of_company(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = p_user_id
      AND cm.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_superadmin(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id 
    AND role = 'superadmin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_company_owner(target_company_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM company_members
    WHERE company_id = target_company_id
    AND user_id = target_user_id
    AND role = 'owner'
    AND status = 'active'
  );
END;
$function$;

-- 5. Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.is_superadmin());

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);