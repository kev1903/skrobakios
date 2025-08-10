-- Fix ambiguous parameter names in helper and harden search_path
create or replace function public.is_company_member_secure(
  p_company_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = p_user_id
      and cm.status = 'active'
  );
$$;

-- Also align our recent helper to ensure consistent search_path and names
create or replace function public.is_project_member(
  p_project_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = p_user_id
      and pm.status = 'active'
  );
$$;