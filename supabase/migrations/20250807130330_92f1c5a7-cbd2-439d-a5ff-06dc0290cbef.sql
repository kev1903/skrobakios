-- Check what tables already exist and create only missing ones
DO $$
BEGIN
  -- Create platform settings table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_settings') THEN
    CREATE TABLE public.platform_settings (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value JSONB NOT NULL DEFAULT '{}',
      setting_type TEXT NOT NULL DEFAULT 'general',
      description TEXT,
      is_sensitive BOOLEAN NOT NULL DEFAULT false,
      requires_restart BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      last_modified_by UUID REFERENCES auth.users(id)
    );
    
    ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Superadmins can manage platform settings"
    ON public.platform_settings
    FOR ALL
    TO authenticated
    USING (public.is_superadmin(auth.uid()))
    WITH CHECK (public.is_superadmin(auth.uid()));
  END IF;

  -- Create platform audit logs table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_audit_logs') THEN
    CREATE TABLE public.platform_audit_logs (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      action_type TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id UUID,
      user_id UUID REFERENCES auth.users(id),
      action_details JSONB DEFAULT '{}',
      ip_address INET,
      user_agent TEXT,
      session_id TEXT,
      severity_level TEXT NOT NULL DEFAULT 'info',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Superadmins can view platform audit logs"
    ON public.platform_audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin(auth.uid()));
  END IF;

  -- Create company overrides table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_overrides') THEN
    CREATE TABLE public.company_overrides (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      override_type TEXT NOT NULL,
      override_key TEXT NOT NULL,
      override_value JSONB NOT NULL DEFAULT '{}',
      reason TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      last_modified_by UUID REFERENCES auth.users(id),
      UNIQUE(company_id, override_type, override_key)
    );
    
    ALTER TABLE public.company_overrides ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Superadmins can manage company overrides"
    ON public.company_overrides
    FOR ALL
    TO authenticated
    USING (public.is_superadmin(auth.uid()))
    WITH CHECK (public.is_superadmin(auth.uid()));
  END IF;

  -- Create feature flags table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
    CREATE TABLE public.feature_flags (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      flag_name TEXT NOT NULL UNIQUE,
      flag_key TEXT NOT NULL UNIQUE,
      description TEXT,
      is_enabled BOOLEAN NOT NULL DEFAULT false,
      rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
      target_users JSONB DEFAULT '[]',
      target_companies JSONB DEFAULT '[]',
      conditions JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      last_modified_by UUID REFERENCES auth.users(id)
    );
    
    ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Superadmins can manage feature flags"
    ON public.feature_flags
    FOR ALL
    TO authenticated
    USING (public.is_superadmin(auth.uid()))
    WITH CHECK (public.is_superadmin(auth.uid()));
  END IF;

  -- Create maintenance windows table if it doesn't exist
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_windows') THEN
    CREATE TABLE public.maintenance_windows (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
      scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
      actual_start TIMESTAMP WITH TIME ZONE,
      actual_end TIMESTAMP WITH TIME ZONE,
      maintenance_type TEXT NOT NULL DEFAULT 'planned',
      affected_services JSONB DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'scheduled',
      notification_sent BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      created_by UUID REFERENCES auth.users(id)
    );
    
    ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Superadmins can manage maintenance windows"
    ON public.maintenance_windows
    FOR ALL
    TO authenticated
    USING (public.is_superadmin(auth.uid()))
    WITH CHECK (public.is_superadmin(auth.uid()));
  END IF;
END $$;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platform_settings') THEN
    DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
    CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_platform_settings_updated_at();
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_overrides') THEN
    DROP TRIGGER IF EXISTS update_company_overrides_updated_at ON public.company_overrides;
    CREATE TRIGGER update_company_overrides_updated_at
    BEFORE UPDATE ON public.company_overrides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
    DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
    CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_windows') THEN
    DROP TRIGGER IF EXISTS update_maintenance_windows_updated_at ON public.maintenance_windows;
    CREATE TRIGGER update_maintenance_windows_updated_at
    BEFORE UPDATE ON public.maintenance_windows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;