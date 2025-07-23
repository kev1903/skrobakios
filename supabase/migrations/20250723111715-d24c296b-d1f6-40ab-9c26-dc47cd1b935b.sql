-- Update the profiles table to ensure 'revoked' is a valid status
-- Since there's no check constraint, we just need to make sure the application handles it
-- Let's also update the status badge rendering to handle the revoked status

COMMENT ON COLUMN profiles.status IS 'Valid values: active, invited, revoked';