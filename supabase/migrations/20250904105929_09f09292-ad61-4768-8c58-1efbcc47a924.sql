-- More comprehensive search for security definer views
-- Check all objects with security definer property
SELECT 
    n.nspname as schema_name,
    c.relname as object_name,
    c.relkind as object_type,
    pg_get_viewdef(c.oid) as view_definition
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relkind = 'v'  -- views only
AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
AND pg_get_viewdef(c.oid) ILIKE '%SECURITY DEFINER%';