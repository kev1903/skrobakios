-- Add status column to profiles table to track user invitation status
ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Add index for better performance on status queries
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update RLS policies to prevent access for invited users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- New RLS policies that only allow access for active users
CREATE POLICY "Active users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id AND status = 'active');

CREATE POLICY "Active users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'active');

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow superadmins to view and manage all profiles
CREATE POLICY "Superadmin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_superadmin(auth.uid()));

-- Create function to handle user signup and activate invited users
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's an existing invited profile for this email
  UPDATE public.profiles 
  SET user_id = NEW.id, 
      status = 'active',
      updated_at = now()
  WHERE email = NEW.email 
    AND status = 'invited' 
    AND user_id IS NULL;
  
  -- If no invited profile was found, create a new active profile
  IF NOT FOUND THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, status)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email,
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;