-- Add text_formatting column to wbs_items table to store bold, italic, underline, and fontSize formatting
ALTER TABLE public.wbs_items 
ADD COLUMN IF NOT EXISTS text_formatting JSONB DEFAULT NULL;

-- Add a comment to describe the column
COMMENT ON COLUMN public.wbs_items.text_formatting IS 'Stores text formatting options: bold, italic, underline, fontSize';