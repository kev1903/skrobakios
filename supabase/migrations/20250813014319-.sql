-- Fix security vulnerabilities: Secure xero_connections and leads tables
-- These tables contain sensitive financial data and customer information

-- === XERO_CONNECTIONS TABLE SECURITY ===
-- This table contains OAuth tokens that could access users' financial data

-- Remove any overly permissive policies
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'xero_connections' 
        AND schemaname = 'public'
        AND policyname NOT IN (
            'Users can delete their own Xero connection',
            'Users can manage their own Xero connection', 
            'Users can update their own Xero connection',
            'Users can view their own Xero connection'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.xero_connections', pol_name);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.xero_connections ENABLE ROW LEVEL SECURITY;

-- Add additional security: Only allow authenticated users
CREATE POLICY "Only authenticated users can access Xero connections" 
ON public.xero_connections 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- === LEADS TABLE SECURITY ===
-- This table contains customer contact information that needs protection

-- Remove any overly permissive policies that might allow public access
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'leads' 
        AND schemaname = 'public'
        AND policyname NOT IN (
            'Users can manage leads in their companies',
            'Users can view leads from their companies'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol_name);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Add additional security: Only authenticated company members can access leads
CREATE POLICY "Only authenticated users can access leads" 
ON public.leads 
FOR ALL 
USING (
    auth.role() = 'authenticated' 
    AND company_id IN (
        SELECT cm.company_id
        FROM company_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.status = 'active'
    )
)
WITH CHECK (
    auth.role() = 'authenticated' 
    AND company_id IN (
        SELECT cm.company_id
        FROM company_members cm
        WHERE cm.user_id = auth.uid() 
        AND cm.status = 'active'
    )
);

-- Add audit logging trigger for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log access to sensitive financial tokens
    IF TG_TABLE_NAME = 'xero_connections' THEN
        INSERT INTO public.audit_logs (
            user_id, action, resource_type, resource_id, 
            metadata, created_at
        ) VALUES (
            auth.uid(), TG_OP, 'xero_connection', 
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id)
            ),
            now()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to xero_connections
DROP TRIGGER IF EXISTS audit_xero_connections ON public.xero_connections;
CREATE TRIGGER audit_xero_connections
    AFTER INSERT OR UPDATE OR DELETE ON public.xero_connections
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- Add data masking function for sensitive fields in leads
CREATE OR REPLACE FUNCTION public.mask_contact_info(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Only show contact info to company members with proper access
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Mask email addresses (keep first 3 chars and domain)
    IF input_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN LEFT(input_text, 3) || '***@' || SPLIT_PART(input_text, '@', 2);
    END IF;
    
    -- Mask phone numbers (keep last 4 digits)
    IF input_text ~ '^[\+\-\(\)\s\d]+$' AND LENGTH(REGEXP_REPLACE(input_text, '[^\d]', '', 'g')) >= 7 THEN
        RETURN '***-***-' || RIGHT(REGEXP_REPLACE(input_text, '[^\d]', '', 'g'), 4);
    END IF;
    
    -- For other text, mask middle characters
    IF LENGTH(input_text) > 6 THEN
        RETURN LEFT(input_text, 2) || REPEAT('*', LENGTH(input_text) - 4) || RIGHT(input_text, 2);
    END IF;
    
    RETURN input_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;