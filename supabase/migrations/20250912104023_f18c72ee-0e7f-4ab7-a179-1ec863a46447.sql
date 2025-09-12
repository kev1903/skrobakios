-- Fix Security Definer View issue - Enable SECURITY INVOKER mode for all public views
-- This ensures views use the privileges of the querying user rather than the view creator
-- and properly respect Row Level Security policies

-- Drop and recreate project_scope_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.project_scope_view CASCADE;

CREATE VIEW public.project_scope_view 
WITH (security_invoker=on) AS
WITH RECURSIVE scope_hierarchy AS (
  SELECT 
    id, company_id, project_id, parent_id, wbs_id, title, description, 
    assigned_to, start_date, end_date, duration, budgeted_cost, actual_cost, 
    progress, status, health, progress_status, at_risk, level, category, 
    priority, is_expanded, linked_tasks, created_at, updated_at,
    ARRAY[wbs_id] AS path,
    0 AS depth
  FROM wbs_items
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    w.id, w.company_id, w.project_id, w.parent_id, w.wbs_id, w.title, w.description,
    w.assigned_to, w.start_date, w.end_date, w.duration, w.budgeted_cost, w.actual_cost,
    w.progress, w.status, w.health, w.progress_status, w.at_risk, w.level, w.category,
    w.priority, w.is_expanded, w.linked_tasks, w.created_at, w.updated_at,
    sh.path || w.wbs_id,
    sh.depth + 1
  FROM wbs_items w
  JOIN scope_hierarchy sh ON w.parent_id = sh.id
)
SELECT * FROM scope_hierarchy
ORDER BY path;

-- Drop and recreate safe_public_profiles with SECURITY INVOKER
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

CREATE VIEW public.safe_public_profiles 
WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.avatar_url,
  p.company,
  p.professional_title,
  p.bio,
  p.slug,
  p.rating,
  p.review_count,
  p.years_experience,
  p.skills,
  p.services,
  p.verified,
  p.social_links,
  p.meta_title,
  p.meta_description,
  p.website,
  -- Only show sensitive data if user allows it
  CASE WHEN p.show_email = true THEN p.email ELSE NULL END as email,
  CASE WHEN p.show_phone = true THEN p.phone ELSE NULL END as phone,
  CASE WHEN p.show_location = true THEN p.location ELSE NULL END as location,
  -- Never expose birth date publicly
  NULL as birth_date,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.public_profile = true 
AND p.status = 'active'
AND can_view_profile_safely(p.user_id);

-- Drop and recreate stakeholder_contacts_safe with SECURITY INVOKER
DROP VIEW IF EXISTS public.stakeholder_contacts_safe CASCADE;

CREATE VIEW public.stakeholder_contacts_safe 
WITH (security_invoker=on) AS
SELECT 
  id,
  stakeholder_id,
  name,
  title,
  -- Mask email addresses by showing first 2 chars, *** and domain
  CASE 
    WHEN email IS NOT NULL THEN 
      regexp_replace(email, '^(.{2})[^@]*(@.*)$', '\1***\2')
    ELSE NULL 
  END as email_masked,
  -- Mask phone numbers by showing first 3 chars, *** and last 2
  CASE 
    WHEN phone IS NOT NULL THEN 
      regexp_replace(phone, '^(.{3}).*(.{2})$', '\1***\2')
    ELSE NULL 
  END as phone_masked,
  -- Mask mobile numbers by showing first 3 chars, *** and last 2  
  CASE 
    WHEN mobile IS NOT NULL THEN 
      regexp_replace(mobile, '^(.{3}).*(.{2})$', '\1***\2')
    ELSE NULL 
  END as mobile_masked,
  is_primary,
  is_preferred,
  created_at
FROM stakeholder_contacts sc;

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.project_scope_view TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.stakeholder_contacts_safe TO authenticated;