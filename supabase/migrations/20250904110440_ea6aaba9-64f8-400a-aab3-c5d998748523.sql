-- Set SECURITY INVOKER on public views to satisfy linter 0010 and enforce querying user's RLS
DO $$
BEGIN
  -- stakeholder_contacts_safe
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v' AND n.nspname = 'public' AND c.relname = 'stakeholder_contacts_safe'
  ) THEN
    EXECUTE 'ALTER VIEW public.stakeholder_contacts_safe SET (security_invoker = true)';
  END IF;

  -- project_scope_view
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v' AND n.nspname = 'public' AND c.relname = 'project_scope_view'
  ) THEN
    EXECUTE '' || 'ALTER VIEW public.project_scope_view SET (security_invoker = true)';
  END IF;
END $$;

-- Note: Not altering views in reserved schemas (vault, extensions) as per platform guidelines.