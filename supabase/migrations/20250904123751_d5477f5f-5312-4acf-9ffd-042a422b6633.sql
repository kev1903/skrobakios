-- Remove Digital Objects functionality completely

-- 1. Drop the digital_objects table and all related data
DROP TABLE IF EXISTS public.digital_objects CASCADE;

-- 2. Remove digital_twin_events column from projects table
ALTER TABLE public.projects DROP COLUMN IF EXISTS digital_twin_events;

-- 3. Remove any storage buckets related to digital objects/twins
DELETE FROM storage.buckets WHERE name IN ('digital-objects', 'digital-twins', 'digital_objects', 'digital_twins');

-- 4. Clean up any permissions or settings related to digital objects
DELETE FROM public.user_permissions WHERE permission_key IN ('digital-objects', 'digital-twin');
DELETE FROM public.company_permission_settings WHERE permission_key IN ('digital-objects', 'digital-twin');

-- 5. Remove any audit logs related to digital objects (optional cleanup)
DELETE FROM public.audit_logs WHERE resource_type IN ('digital_object', 'digital-objects');

-- Log the cleanup action
INSERT INTO public.audit_logs (
  user_id,
  action,
  resource_type,
  metadata,
  created_at
) VALUES (
  auth.uid(),
  'CLEANUP_DIGITAL_OBJECTS',
  'system',
  jsonb_build_object(
    'action', 'removed_digital_objects_functionality',
    'timestamp', now(),
    'tables_dropped', ARRAY['digital_objects'],
    'columns_removed', ARRAY['projects.digital_twin_events'],
    'permissions_cleaned', ARRAY['digital-objects', 'digital-twin']
  ),
  now()
);