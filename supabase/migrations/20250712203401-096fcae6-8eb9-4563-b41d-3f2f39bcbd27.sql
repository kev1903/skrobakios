-- Add RLS policy to allow users to view companies they are members of
CREATE POLICY "Users can view companies they are members of" 
ON public.companies 
FOR SELECT 
USING (
  id IN (
    SELECT cm.company_id 
    FROM company_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.status = 'active'
  )
);