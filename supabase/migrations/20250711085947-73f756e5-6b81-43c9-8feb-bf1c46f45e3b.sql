-- Create new edge function to directly create users with generic passwords
-- Update user creation process to bypass invitation system

-- First, let's add a new column to track if a user was created with a generic password
ALTER TABLE public.profiles 
ADD COLUMN needs_password_reset boolean DEFAULT false;

-- Create a new edge function for direct user creation (this will be done in the function file)