-- Allow superadmin to create invited profiles
CREATE POLICY "Superadmin can create invited profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (is_superadmin(auth.uid()) AND status = 'invited');