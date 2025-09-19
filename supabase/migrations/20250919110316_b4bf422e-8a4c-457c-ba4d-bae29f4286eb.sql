-- Add RLS policy to allow company members to see each other's profiles
CREATE POLICY "Company members can view member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_id IN (
    SELECT DISTINCT cm1.user_id 
    FROM company_members cm1 
    WHERE cm1.company_id IN (
      SELECT cm2.company_id 
      FROM company_members cm2 
      WHERE cm2.user_id = auth.uid() 
      AND cm2.status = 'active'
    )
    AND cm1.status = 'active'
  )
  OR user_id = auth.uid()
);