-- Add missing columns to xero_invoices table
ALTER TABLE public.xero_invoices 
ADD COLUMN IF NOT EXISTS sub_total NUMERIC,
ADD COLUMN IF NOT EXISTS total_tax NUMERIC;