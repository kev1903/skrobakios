-- Add missing columns to bills table
ALTER TABLE public.bills 
  ADD COLUMN IF NOT EXISTS paid_to_date NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS file_attachments TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS forwarded_bill BOOLEAN DEFAULT false;