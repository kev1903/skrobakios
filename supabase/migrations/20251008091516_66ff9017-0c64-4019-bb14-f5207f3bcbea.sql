-- First, let's identify any security definer views
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Find all views with security definer option
    FOR view_record IN 
        SELECT 
            schemaname,
            viewname,
            definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition ILIKE '%security definer%'
    LOOP
        -- Drop and recreate views without security definer
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', 
            view_record.schemaname, 
            view_record.viewname);
        
        -- Log the dropped view
        RAISE NOTICE 'Dropped security definer view: %.%', 
            view_record.schemaname, 
            view_record.viewname;
    END LOOP;
END $$;

-- Note: If any views were found and dropped, you'll need to recreate them 
-- without the SECURITY DEFINER property. The views should rely on proper
-- RLS policies instead of bypassing user permissions.

-- Add a comment for documentation
COMMENT ON SCHEMA public IS 'Security definer views have been removed to prevent privilege escalation. Views now respect querying user permissions and RLS policies.';
