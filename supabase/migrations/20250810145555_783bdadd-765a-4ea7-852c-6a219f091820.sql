-- Create helper to avoid recursive RLS on project_members
create or replace function public.is_project_member(target_project_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = target_user_id
      and pm.status = 'active'
  );
$$;

-- Replace recursive policies on project_documents
drop policy if exists "Users can insert project documents for their projects" on public.project_documents;
drop policy if exists "Users can update project documents they have access to" on public.project_documents;
drop policy if exists "Users can view project documents they have access to" on public.project_documents;

create policy "Users can insert project documents they have access to"
on public.project_documents
for insert
to authenticated
with check (
  (project_id is not null and public.is_project_member(project_id, auth.uid()))
  or
  (estimate_id is not null and exists (
    select 1 from public.estimates e
    where e.id = estimate_id
      and public.is_company_member_secure(e.company_id, auth.uid())
  ))
);

create policy "Users can update project documents they have access to"
on public.project_documents
for update
to authenticated
using (
  (project_id is not null and public.is_project_member(project_id, auth.uid()))
  or
  (estimate_id is not null and exists (
    select 1 from public.estimates e
    where e.id = estimate_id
      and public.is_company_member_secure(e.company_id, auth.uid())
  ))
);

create policy "Users can view project documents they have access to"
on public.project_documents
for select
to authenticated
using (
  (project_id is not null and public.is_project_member(project_id, auth.uid()))
  or
  (estimate_id is not null and exists (
    select 1 from public.estimates e
    where e.id = estimate_id
      and public.is_company_member_secure(e.company_id, auth.uid())
  ))
);
