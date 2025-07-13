-- Check for triggers that might be causing conflicts
SELECT 
    t.trigger_name,
    t.event_object_table,
    t.action_timing,
    t.event_manipulation,
    p.proname as function_name
FROM information_schema.triggers t
JOIN pg_proc p ON p.oid = t.action_statement::regproc
WHERE t.trigger_schema = 'public'
ORDER BY t.trigger_name;