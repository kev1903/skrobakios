-- Fix Critical Security Issue: Secure Estimates and Pricing Data

-- 1. Drop the overly permissive policy that allows anyone to view estimates
DROP POLICY IF EXISTS "Anyone can view estimates" ON public.estimates;

-- 2. Create secure policies for estimates table
-- Only allow estimate creators and company members to view estimates
CREATE POLICY "Company members can view company estimates" 
ON public.estimates 
FOR SELECT 
USING (
  -- User is the creator of the estimate
  (auth.uid() = created_by) 
  OR 
  -- User is member of the company that owns the estimate
  (company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ))
);

-- 3. Update existing policies to use company membership for updates/deletes
DROP POLICY IF EXISTS "Users can delete estimates they created" ON public.estimates;
DROP POLICY IF EXISTS "Users can update estimates they created" ON public.estimates;

CREATE POLICY "Company members can update company estimates" 
ON public.estimates 
FOR UPDATE 
USING (
  (auth.uid() = created_by) 
  OR 
  (company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  ))
)
WITH CHECK (
  (auth.uid() = created_by) 
  OR 
  (company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  ))
);

CREATE POLICY "Company members can delete company estimates" 
ON public.estimates 
FOR DELETE 
USING (
  (auth.uid() = created_by) 
  OR 
  (company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
    AND cm.role IN ('owner', 'admin')
  ))
);

-- 4. Update insert policy to ensure company membership
DROP POLICY IF EXISTS "Authenticated users can create estimates" ON public.estimates;

CREATE POLICY "Company members can create estimates" 
ON public.estimates 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND 
  (company_id IN (
    SELECT cm.company_id
    FROM company_members cm
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ))
);

-- 5. Create estimate_line_items table if it doesn't exist and secure it
CREATE TABLE IF NOT EXISTS public.estimate_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  trade_name text NOT NULL,
  description text,
  quantity numeric DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on estimate_line_items
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;

-- 6. Create secure policies for estimate_line_items
CREATE POLICY "Company members can view estimate line items" 
ON public.estimate_line_items 
FOR SELECT 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    WHERE (
      (auth.uid() = e.created_by) 
      OR 
      (e.company_id IN (
        SELECT cm.company_id
        FROM company_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.status = 'active'
      ))
    )
  )
);

CREATE POLICY "Company members can manage estimate line items" 
ON public.estimate_line_items 
FOR ALL 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    WHERE (
      (auth.uid() = e.created_by) 
      OR 
      (e.company_id IN (
        SELECT cm.company_id
        FROM company_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.status = 'active'
        AND cm.role IN ('owner', 'admin', 'member')
      ))
    )
  )
)
WITH CHECK (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    WHERE (
      (auth.uid() = e.created_by) 
      OR 
      (e.company_id IN (
        SELECT cm.company_id
        FROM company_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.status = 'active'
        AND cm.role IN ('owner', 'admin', 'member')
      ))
    )
  )
);

-- 7. Add trigger for estimate_line_items updated_at
CREATE OR REPLACE FUNCTION public.update_estimate_line_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_estimate_line_items_updated_at
  BEFORE UPDATE ON public.estimate_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimate_line_items_updated_at();