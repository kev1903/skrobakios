
-- 1) Table
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  company_id uuid not null,
  name text not null,
  description text,
  type text not null default 'document',
  file_url text not null,
  file_path text,
  file_type text,
  file_size bigint,
  pages integer,
  status text not null default 'active',
  ai_confidence numeric(5,2),
  ai_rationale text,
  ai_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_project_documents_project_id on public.project_documents(project_id);
create index if not exists idx_project_documents_company_id on public.project_documents(company_id);
create index if not exists idx_project_documents_type on public.project_documents(type);
create index if not exists idx_project_documents_status on public.project_documents(status);

-- 2) RLS
alter table public.project_documents enable row level security;

-- Company members of the related project can view
create policy if not exists "Users can view project documents from their companies"
on public.project_documents
for select
using (
  project_id in (
    select p.id
    from projects p
    join company_members cm on p.company_id = cm.company_id
    where cm.user_id = auth.uid() and cm.status = 'active'
  )
);

-- Company members can insert documents for their company projects
create policy if not exists "Users can insert project documents in their companies"
on public.project_documents
for insert
with check (
  project_id in (
    select p.id
    from projects p
    join company_members cm on p.company_id = cm.company_id
    where cm.user_id = auth.uid() and cm.status = 'active'
  )
);

-- Company members can update their company project documents
create policy if not exists "Users can update project documents in their companies"
on public.project_documents
for update
using (
  project_id in (
    select p.id
    from projects p
    join company_members cm on p.company_id = cm.company_id
    where cm.user_id = auth.uid() and cm.status = 'active'
  )
)
with check (
  project_id in (
    select p.id
    from projects p
    join company_members cm on p.company_id = cm.company_id
    where cm.user_id = auth.uid() and cm.status = 'active'
  )
);

-- Company members can delete their company project documents
create policy if not exists "Users can delete project documents in their companies"
on public.project_documents
for delete
using (
  project_id in (
    select p.id
    from projects p
    join company_members cm on p.company_id = cm.company_id
    where cm.user_id = auth.uid() and cm.status = 'active'
  )
);

-- 3) Triggers: set company_id (and created_by), and keep updated_at fresh

create or replace function public.set_project_documents_company_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Derive company_id from project if missing
  if new.company_id is null then
    select p.company_id into new.company_id
    from projects p
    where p.id = new.project_id;
  end if;

  -- Stamp creator if not provided
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  -- Keep updated_at fresh
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_project_documents_set_company on public.project_documents;
create trigger trg_project_documents_set_company
before insert on public.project_documents
for each row
execute function public.set_project_documents_company_id();

-- updated_at on updates
drop trigger if exists trg_project_documents_updated_at on public.project_documents;
create trigger trg_project_documents_updated_at
before update on public.project_documents
for each row
execute function public.update_updated_at_column();
