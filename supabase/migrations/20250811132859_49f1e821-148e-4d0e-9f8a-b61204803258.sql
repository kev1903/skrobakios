-- Secure financial records in xero_invoices with RLS and least-privilege policies
DO $$
BEGIN
  -- Ensure table exists before applying changes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'xero_invoices'
  ) THEN
    RAISE NOTICE 'Table public.xero_invoices does not exist; skipping RLS setup.';
    RETURN;
  END IF;

  -- Enable Row Level Security
  EXECUTE 'ALTER TABLE public.xero_invoices ENABLE ROW LEVEL SECURITY';

  -- Drop any overly-permissive or legacy policies if present
  FOR policy_name IN (
    SELECT pol.polname
    FROM pg_policies pol
    WHERE pol.schemaname = 'public' AND pol.tablename = 'xero_invoices'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.xero_invoices', policy_name);
  END LOOP;

  -- Create strict policies: users can only manage their own records
  EXECUTE $$
    CREATE POLICY "Users can view their own Xero invoices"
    ON public.xero_invoices
    FOR SELECT
    USING (auth.uid() = user_id);
  $$;

  EXECUTE $$
    CREATE POLICY "Users can insert their own Xero invoices"
    ON public.xero_invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  $$;

  EXECUTE $$
    CREATE POLICY "Users can update their own Xero invoices"
    ON public.xero_invoices
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  $$;

  EXECUTE $$
    CREATE POLICY "Users can delete their own Xero invoices"
    ON public.xero_invoices
    FOR DELETE
    USING (auth.uid() = user_id);
  $$;

  -- Helpful index for performance (no-op if it already exists)
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_xero_invoices_user_id ON public.xero_invoices (user_id)';
END
$$ LANGUAGE plpgsql;