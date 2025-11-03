-- Drop the existing foreign key constraint
ALTER TABLE public.bill_notes 
DROP CONSTRAINT IF EXISTS bill_notes_created_by_fkey;

-- Add foreign key constraint to profiles(user_id) instead
ALTER TABLE public.bill_notes 
ADD CONSTRAINT bill_notes_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;