-- Add status column to time_entries if it doesn't exist and update existing records
DO $$ 
BEGIN
    -- Check if status column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' AND column_name = 'status'
    ) THEN
        -- Add status column
        ALTER TABLE public.time_entries ADD COLUMN status TEXT DEFAULT 'completed';
        
        -- Update existing records to set status based on existing data
        UPDATE public.time_entries 
        SET status = CASE 
            WHEN end_time IS NULL THEN 'running'
            ELSE 'completed'
        END;
        
        -- Make status NOT NULL
        ALTER TABLE public.time_entries ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;