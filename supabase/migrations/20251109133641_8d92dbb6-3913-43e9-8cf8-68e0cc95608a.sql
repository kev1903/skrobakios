-- Create user_rates table to store hourly and daily rates for users
CREATE TABLE IF NOT EXISTS public.user_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'daily')),
  rate_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.user_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view rates for their own company members
CREATE POLICY "Users can view rates in their companies"
ON public.user_rates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.company_id = user_rates.company_id
    AND cm.user_id = auth.uid()
    AND cm.status = 'active'
  )
);

-- Policy: Company admins and owners can insert rates
CREATE POLICY "Company admins can insert rates"
ON public.user_rates
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_company_admin_or_owner(company_id, auth.uid())
);

-- Policy: Company admins and owners can update rates
CREATE POLICY "Company admins can update rates"
ON public.user_rates
FOR UPDATE
TO authenticated
USING (
  public.is_company_admin_or_owner(company_id, auth.uid())
)
WITH CHECK (
  public.is_company_admin_or_owner(company_id, auth.uid())
);

-- Policy: Company admins and owners can delete rates
CREATE POLICY "Company admins can delete rates"
ON public.user_rates
FOR DELETE
TO authenticated
USING (
  public.is_company_admin_or_owner(company_id, auth.uid())
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_rates_updated_at
BEFORE UPDATE ON public.user_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_tasks_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_user_rates_user_company ON public.user_rates(user_id, company_id);
CREATE INDEX idx_user_rates_company ON public.user_rates(company_id);