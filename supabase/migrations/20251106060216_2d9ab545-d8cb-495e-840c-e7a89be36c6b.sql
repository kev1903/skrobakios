-- Create default permissions when a user is added to a company
-- This ensures users have appropriate access based on their company role

CREATE OR REPLACE FUNCTION public.create_default_user_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  default_modules text[][] := ARRAY[
    ARRAY['business_map', 'business_map'],
    ARRAY['projects', 'dashboard'],
    ARRAY['projects', 'task'],
    ARRAY['projects', 'team'],
    ARRAY['sales', 'leads'],
    ARRAY['sales', 'crm'],
    ARRAY['finance', 'invoicing'],
    ARRAY['finance', 'estimates'],
    ARRAY['stakeholders', 'clients'],
    ARRAY['stakeholders', 'vendors']
  ];
  module_pair text[];
  default_access_level text;
BEGIN
  -- Only create permissions for active members
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Determine default access level based on company role
  default_access_level := CASE NEW.role
    WHEN 'owner' THEN 'can_edit'
    WHEN 'admin' THEN 'can_edit'
    WHEN 'manager' THEN 'can_view'
    WHEN 'member' THEN 'can_view'
    ELSE 'no_access'
  END;

  -- Create default permissions for each module
  FOREACH module_pair SLICE 1 IN ARRAY default_modules
  LOOP
    INSERT INTO public.user_module_permissions (
      user_id,
      company_id,
      module_id,
      sub_module_id,
      access_level,
      created_by,
      updated_by
    )
    VALUES (
      NEW.user_id,
      NEW.company_id,
      module_pair[1],
      module_pair[2],
      default_access_level,
      auth.uid(),
      auth.uid()
    )
    ON CONFLICT (user_id, company_id, module_id, sub_module_id) 
    DO NOTHING; -- Don't overwrite existing permissions
  END LOOP;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_default_permissions_trigger ON public.company_members;

-- Create trigger that fires when a user is added to a company or status changes to active
CREATE TRIGGER create_default_permissions_trigger
AFTER INSERT OR UPDATE OF status ON public.company_members
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION public.create_default_user_permissions();

-- Backfill permissions for existing active company members who don't have any
DO $$
DECLARE
  member_record RECORD;
BEGIN
  FOR member_record IN 
    SELECT DISTINCT cm.user_id, cm.company_id, cm.role
    FROM public.company_members cm
    LEFT JOIN public.user_module_permissions ump 
      ON cm.user_id = ump.user_id AND cm.company_id = ump.company_id
    WHERE cm.status = 'active'
    AND ump.id IS NULL
  LOOP
    -- Temporarily set a user context for the trigger
    PERFORM set_config('request.jwt.claims', json_build_object('sub', member_record.user_id)::text, true);
    
    -- Insert a dummy update to trigger the permission creation
    UPDATE public.company_members 
    SET updated_at = now()
    WHERE user_id = member_record.user_id 
    AND company_id = member_record.company_id;
  END LOOP;
END $$;