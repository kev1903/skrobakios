-- First, let's check what enum values currently exist
DO $$
BEGIN
    -- Check if the app_role enum exists and what values it has
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        RAISE NOTICE 'app_role enum exists';
    ELSE
        RAISE NOTICE 'app_role enum does not exist';
    END IF;
END $$;

-- Create or update the app_role enum to include all needed values
DO $$
BEGIN
    -- Create the enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'superadmin',
            'platform_admin', 
            'business_admin',
            'company_admin',
            'project_admin',
            'user',
            'client'
        );
        RAISE NOTICE 'Created app_role enum';
    ELSE
        -- Add missing enum values if they don't exist
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'platform_admin';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, ignore
        END;
        
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business_admin';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, ignore
        END;
        
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company_admin';
        EXCEPTION WHEN duplicate_object THEN
            -- Value already exists, ignore
        END;
        
        RAISE NOTICE 'Updated app_role enum with missing values';
    END IF;
END $$;

-- Ensure user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Update the delete_user_completely function to be more thorough
CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
  deleted_count INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- Start transaction
  BEGIN
    -- Delete from all user-related tables in the correct order to avoid foreign key constraints
    
    -- Delete user roles first
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_roles records', deleted_count;
    
    -- Delete notifications
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % notifications records', deleted_count;
    
    -- Delete time entries
    DELETE FROM public.time_entries WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_entries records', deleted_count;
    
    -- Delete time tracking settings
    DELETE FROM public.time_tracking_settings WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_tracking_settings records', deleted_count;
    
    -- Delete time blocks
    DELETE FROM public.time_blocks WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_blocks records', deleted_count;
    
    -- Delete time categories
    DELETE FROM public.time_categories WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % time_categories records', deleted_count;
    
    -- Delete invoice allocations
    DELETE FROM public.invoice_allocations WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % invoice_allocations records', deleted_count;
    
    -- Delete xero-related data
    DELETE FROM public.xero_oauth_states WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.xero_invoices WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.xero_contacts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.xero_accounts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.xero_connections WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % xero-related records total', deleted_count;
    
    -- Delete AI chat logs and interactions
    DELETE FROM public.ai_chat_logs WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.ai_chat_interactions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % AI chat records total', deleted_count;
    
    -- Delete subscription and billing data
    DELETE FROM public.user_subscriptions WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    
    DELETE FROM public.billing_history WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % subscription/billing records total', deleted_count;
    
    -- Delete user access tokens
    DELETE FROM public.user_access_tokens WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_access_tokens records', deleted_count;
    
    -- Delete user contexts
    DELETE FROM public.user_contexts WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % user_contexts records', deleted_count;
    
    -- Update references to NULL instead of deleting
    UPDATE public.model_3d SET uploaded_by = NULL WHERE uploaded_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % model_3d records to remove user reference', deleted_count;
    
    UPDATE public.companies SET created_by = NULL WHERE created_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % companies records to remove user reference', deleted_count;
    
    UPDATE public.estimates SET created_by = NULL WHERE created_by = target_user_id;
    UPDATE public.estimates SET last_modified_by = NULL WHERE last_modified_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % estimates records to remove user references', deleted_count;
    
    UPDATE public.project_costs SET created_by = NULL WHERE created_by = target_user_id;
    UPDATE public.project_costs SET last_modified_by = NULL WHERE last_modified_by = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % project_costs records to remove user references', deleted_count;
    
    -- Delete company memberships for this user
    DELETE FROM public.company_members WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % company_members records', deleted_count;
    
    -- Delete project memberships
    DELETE FROM public.project_members WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % project_members records', deleted_count;
    
    -- Finally delete the profile (this should be last)
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE 'Deleted % profiles records', deleted_count;
    
    -- Return success result
    result := json_build_object(
      'success', true,
      'message', 'User data deleted successfully',
      'user_id', target_user_id,
      'total_records_deleted', total_deleted
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Return error with more details
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE,
      'user_id', target_user_id,
      'total_records_deleted', total_deleted
    );
    RETURN result;
  END;
END;
$$;