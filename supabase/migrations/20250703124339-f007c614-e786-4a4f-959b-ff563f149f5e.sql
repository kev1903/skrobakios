-- Add DELETE policy for superadmins to delete profiles
CREATE POLICY "Superadmin can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (is_superadmin(auth.uid()));