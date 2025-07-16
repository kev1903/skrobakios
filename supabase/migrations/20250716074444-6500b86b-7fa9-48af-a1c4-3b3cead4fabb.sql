-- Add missing DELETE policy for sk_25008_design table
CREATE POLICY "Users can delete SK_25008 tasks in their companies" 
ON public.sk_25008_design 
FOR DELETE 
USING (company_id IN ( 
  SELECT cm.company_id
  FROM company_members cm
  WHERE ((cm.user_id = auth.uid()) AND (cm.status = 'active'::text))
));