-- Fix RLS to allow inserting WBS items by authenticated company members
ALTER TABLE public.wbs_items ENABLE ROW LEVEL SECURITY;

-- Create a proper INSERT policy that uses WITH CHECK (INSERT uses WITH CHECK, not USING)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'wbs_items' AND policyname = 'Users can insert WBS items in their companies'
  ) THEN
    CREATE POLICY "Users can insert WBS items in their companies"
    ON public.wbs_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.company_id = wbs_items.company_id
          AND cm.user_id = auth.uid()
          AND cm.status = 'active'
      )
    );
  END IF;
END $$;