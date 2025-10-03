-- Add rfq_required column to wbs_items table
ALTER TABLE public.wbs_items 
ADD COLUMN IF NOT EXISTS rfq_required boolean DEFAULT false;