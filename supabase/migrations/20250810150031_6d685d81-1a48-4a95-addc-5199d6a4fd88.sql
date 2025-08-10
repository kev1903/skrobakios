-- Recreate function with safe parameter names
DROP FUNCTION IF EXISTS public.is_company_member_secure(uuid, uuid);

CREATE OR REPLACE FUNCTION public.is_company_member_secure(
  p_company_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = p_company_id
      AND cm.user_id = p_user_id
      AND cm.status = 'active'
  );
$$;

-- Ensure our project helper exists with safe params (idempotent)
DROP FUNCTION IF EXISTS public.is_project_member(uuid, uuid);
CREATE OR REPLACE FUNCTION public.is_project_member(
  p_project_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p_project_id
      AND pm.user_id = p_user_id
      AND pm.status = 'active'
  );
$$;