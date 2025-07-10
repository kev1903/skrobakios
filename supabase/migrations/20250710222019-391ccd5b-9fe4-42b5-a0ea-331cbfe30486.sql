-- Create a system configuration table to store email settings and other system configurations
CREATE TABLE IF NOT EXISTS public.system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage system configurations
CREATE POLICY "Superadmin can manage system configurations"
ON public.system_configurations
FOR ALL
USING (is_superadmin(auth.uid()));

-- Insert current working email configuration
INSERT INTO public.system_configurations (config_key, config_value, description, created_by) VALUES
('email_sender_domain', 'skrobaki.com', 'Verified domain for sending emails via Resend', (SELECT user_id FROM user_roles WHERE role = 'superadmin' LIMIT 1)),
('email_sender_address', 'kevin@skrobaki.com', 'Working sender email address for invitations', (SELECT user_id FROM user_roles WHERE role = 'superadmin' LIMIT 1)),
('email_provider', 'resend', 'Email service provider being used', (SELECT user_id FROM user_roles WHERE role = 'superadmin' LIMIT 1)),
('email_domain_verified', 'true', 'Domain verification status in Resend', (SELECT user_id FROM user_roles WHERE role = 'superadmin' LIMIT 1)),
('email_domain_verified_date', '2025-07-10', 'Date when domain was verified in Resend', (SELECT user_id FROM user_roles WHERE role = 'superadmin' LIMIT 1));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_system_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_configurations_updated_at
  BEFORE UPDATE ON public.system_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_system_configurations_updated_at();

-- Create an audit log for email sending attempts
CREATE TABLE IF NOT EXISTS public.email_sending_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'user_invitation', 'password_reset', etc.
  status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  resend_email_id TEXT, -- Store Resend's email ID for tracking
  invitation_token UUID, -- Link to user_invitations if applicable
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_sending_log ENABLE ROW LEVEL SECURITY;

-- Superadmins can view all email logs, users can only see their own
CREATE POLICY "Superadmin can view all email logs"
ON public.email_sending_log
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Users can view emails sent to them"
ON public.email_sending_log
FOR SELECT
USING (recipient_email = (SELECT email FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert email logs"
ON public.email_sending_log
FOR INSERT
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE public.system_configurations IS 'Stores system-wide configuration settings including email setup';
COMMENT ON TABLE public.email_sending_log IS 'Audit log for all email sending attempts and their status';
COMMENT ON COLUMN public.system_configurations.config_key IS 'Unique identifier for the configuration setting';
COMMENT ON COLUMN public.system_configurations.config_value IS 'The actual configuration value';
COMMENT ON COLUMN public.email_sending_log.resend_email_id IS 'Resend service email ID for tracking delivery status';