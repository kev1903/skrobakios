-- Create table to persist estimate drawings metadata
create extension if not exists pgcrypto;

create table if not exists public.estimate_drawings (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  name text not null,
  file_path text not null,
  pages integer,
  uploaded_at timestamptz not null default now(),
  created_by uuid
);

alter table public.estimate_drawings enable row level security;

-- RLS: allow owners/updaters of the estimate to manage their drawings
create policy "Users can view their estimate drawings" on public.estimate_drawings
for select using (
  exists (
    select 1 from public.estimates e
    where e.id = estimate_drawings.estimate_id
      and (e.created_by = auth.uid() or e.last_modified_by = auth.uid())
  )
);

create policy "Users can insert their estimate drawings" on public.estimate_drawings
for insert with check (
  exists (
    select 1 from public.estimates e
    where e.id = estimate_drawings.estimate_id
      and (e.created_by = auth.uid() or e.last_modified_by = auth.uid())
  )
);

create policy "Users can update their estimate drawings" on public.estimate_drawings
for update using (
  exists (
    select 1 from public.estimates e
    where e.id = estimate_drawings.estimate_id
      and (e.created_by = auth.uid() or e.last_modified_by = auth.uid())
  )
) with check (
  exists (
    select 1 from public.estimates e
    where e.id = estimate_drawings.estimate_id
      and (e.created_by = auth.uid() or e.last_modified_by = auth.uid())
  )
);

create policy "Users can delete their estimate drawings" on public.estimate_drawings
for delete using (
  exists (
    select 1 from public.estimates e
    where e.id = estimate_drawings.estimate_id
      and (e.created_by = auth.uid() or e.last_modified_by = auth.uid())
  )
);

-- Create a storage bucket for estimate drawings
insert into storage.buckets (id, name, public) values ('estimate-drawings', 'estimate-drawings', true)
on conflict (id) do nothing;

-- Storage policies for the bucket
create policy "Public read for estimate drawings" on storage.objects
for select using (bucket_id = 'estimate-drawings');

create policy "Authenticated manage estimate drawings" on storage.objects
for all using (
  bucket_id = 'estimate-drawings'
) with check (
  bucket_id = 'estimate-drawings'
);
