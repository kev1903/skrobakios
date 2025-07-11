-- Enable real-time for digital_objects table
ALTER TABLE public.digital_objects REPLICA IDENTITY FULL;

-- Add the table to the realtime publication to enable real-time functionality
DO $$ 
BEGIN
    -- Check if the publication exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    -- Add the table to the publication if it's not already there
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'digital_objects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_objects;
    END IF;
END $$;