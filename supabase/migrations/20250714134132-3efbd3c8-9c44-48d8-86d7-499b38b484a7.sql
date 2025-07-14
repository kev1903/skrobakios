-- Add missing fields to profiles table for qualifications, licenses, and awards
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS qualifications text[],
ADD COLUMN IF NOT EXISTS licenses text[],
ADD COLUMN IF NOT EXISTS awards text[];