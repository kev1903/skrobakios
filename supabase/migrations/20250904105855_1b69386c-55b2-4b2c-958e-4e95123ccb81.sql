-- Find all views with SECURITY DEFINER property
SELECT 
    schemaname,
    viewname,
    definition,
    viewowner
FROM pg_views 
WHERE definition ILIKE '%SECURITY DEFINER%'
ORDER BY schemaname, viewname;