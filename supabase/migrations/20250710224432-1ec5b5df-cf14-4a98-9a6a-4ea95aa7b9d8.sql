-- Record domain verification status for email system monitoring
INSERT INTO system_configurations (config_key, config_value, description, is_active, created_by) 
VALUES (
  'resend_domain_verified',
  'true',
  'skrobaki.com domain verified in Resend - confirmed on 2025-07-10',
  true,
  '5213f4be-54a3-4985-a88e-e460154e52fd'
) ON CONFLICT (config_key) DO UPDATE SET 
  config_value = 'true',
  description = 'skrobaki.com domain verified in Resend - confirmed on 2025-07-10',
  updated_at = now();

-- Create notification about successful domain verification
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  is_read
) VALUES (
  '5213f4be-54a3-4985-a88e-e460154e52fd',
  'Email Domain Verified',
  'The skrobaki.com domain has been successfully verified in Resend. Email invitations should now be delivered properly.',
  'info',
  false
);