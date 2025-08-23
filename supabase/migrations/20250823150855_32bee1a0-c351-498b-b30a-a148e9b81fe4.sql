-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Update the company membership to make user active in Skrobaki PM company
UPDATE company_members 
SET status = 'active', updated_at = now()
WHERE user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND company_id = '31f76099-3d79-4c14-bbdf-ae7a2dc0d3e5';