-- Fix Critical Security Issue: Secure Estimates and Pricing Data
-- Prevent competitors from accessing pricing information

-- 1. Drop overly permissive policies on estimates table
DROP POLICY IF EXISTS "Anyone can view estimates" ON public.estimates;

-- 2. Create secure policies for estimates table
CREATE POLICY "Users can view estimates from their companies" 
ON public.estimates 
FOR SELECT 
USING (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can create estimates in their companies" 
ON public.estimates 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can update estimates they created or in their companies" 
ON public.estimates 
FOR UPDATE 
USING (
  (auth.uid() = created_by) OR 
  (company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ))
)
WITH CHECK (
  company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can delete estimates they created or in their companies" 
ON public.estimates 
FOR DELETE 
USING (
  (auth.uid() = created_by) OR 
  (company_id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  ))
);

-- 3. Create estimate_line_items table if it doesn't exist and secure it
CREATE TABLE IF NOT EXISTS public.estimate_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on estimate_line_items
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;

-- 4. Create secure policies for estimate_line_items
CREATE POLICY "Users can view estimate line items from their companies" 
ON public.estimate_line_items 
FOR SELECT 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    JOIN company_members cm ON e.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

CREATE POLICY "Users can manage estimate line items in their companies" 
ON public.estimate_line_items 
FOR ALL 
USING (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    JOIN company_members cm ON e.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
)
WITH CHECK (
  estimate_id IN (
    SELECT e.id 
    FROM estimates e 
    JOIN company_members cm ON e.company_id = cm.company_id 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);

-- 5. Create updated_at trigger for estimate_line_items
CREATE TRIGGER update_estimate_line_items_updated_at
BEFORE UPDATE ON public.estimate_line_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();