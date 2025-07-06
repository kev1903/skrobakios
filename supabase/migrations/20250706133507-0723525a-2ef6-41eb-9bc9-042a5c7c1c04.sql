-- Add project_address column to leads table
ALTER TABLE public.leads 
ADD COLUMN project_address TEXT;