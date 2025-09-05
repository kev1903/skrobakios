-- Ensure required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Ensure the company_members table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

-- Enable RLS on company_members
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate company_members policies to avoid stale deps
DROP POLICY IF EXISTS "Users can view company members in their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company admins can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Users can insert themselves as company members" ON public.company_members;

CREATE POLICY "Users can view company members in their companies"
ON public.company_members FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Company admins can manage members"
ON public.company_members FOR ALL
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active' AND cm.role IN ('owner','admin')
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active' AND cm.role IN ('owner','admin')
  )
);

CREATE POLICY "Users can insert themselves as company members"
ON public.company_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Updated_at trigger for company_members
CREATE OR REPLACE FUNCTION public.update_company_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_members_updated_at ON public.company_members;
CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW EXECUTE FUNCTION public.update_company_members_updated_at();

-- 2) Fix projects RLS policies to explicitly reference public.company_members
-- Enable RLS (idempotent)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop our named policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "Projects: members can view company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can insert company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can update company projects" ON public.projects;
DROP POLICY IF EXISTS "Projects: members can delete company projects" ON public.projects;

-- Recreate with schema-qualified reference
CREATE POLICY "Projects: members can view company projects"
ON public.projects FOR SELECT
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Projects: members can insert company projects"
ON public.projects FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Projects: members can update company projects"
ON public.projects FOR UPDATE
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);

CREATE POLICY "Projects: members can delete company projects"
ON public.projects FOR DELETE
USING (
  company_id IN (
    SELECT cm.company_id FROM public.company_members cm
    WHERE cm.user_id = auth.uid() AND cm.status = 'active'
  )
);
