-- Secure financial records on xero_invoices by enabling RLS and adding least-privilege policies

-- 1) Enable RLS (safe to run multiple times)
ALTER TABLE IF EXISTS public.xero_invoices ENABLE ROW LEVEL SECURITY;

-- 2) Create strict policies scoped to the record owner (user_id)
-- Note: IF EXISTS guards for table existence are handled by IF EXISTS on CREATE POLICY via exception-safe pattern
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='xero_invoices'
  ) THEN
    -- View own invoices
    BEGIN
      CREATE POLICY "Users can view their own Xero invoices"
      ON public.xero_invoices
      FOR SELECT
      USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Insert own invoices
    BEGIN
      CREATE POLICY "Users can insert their own Xero invoices"
      ON public.xero_invoices
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Update own invoices
    BEGIN
      CREATE POLICY "Users can update their own Xero invoices"
      ON public.xero_invoices
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Delete own invoices
    BEGIN
      CREATE POLICY "Users can delete their own Xero invoices"
      ON public.xero_invoices
      FOR DELETE
      USING (auth.uid() = user_id);
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Helpful index for performance
    CREATE INDEX IF NOT EXISTS idx_xero_invoices_user_id ON public.xero_invoices (user_id);
  END IF;
END $$;