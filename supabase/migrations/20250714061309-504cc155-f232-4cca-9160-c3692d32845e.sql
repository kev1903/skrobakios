-- Add foreign key constraints to reviews table for better joins
-- First check if the constraints already exist
DO $$
BEGIN
  -- Add foreign key for reviewer_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_reviewer_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews 
    ADD CONSTRAINT reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Note: We can't add a single foreign key for reviewee_id since it references different tables
  -- based on reviewee_type. The application will handle the joins properly.
END $$;