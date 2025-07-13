-- Add proper constraint for token_type if it doesn't exist
ALTER TABLE user_access_tokens 
DROP CONSTRAINT IF EXISTS user_access_tokens_token_type_check;

-- Add the correct constraint for token_type
ALTER TABLE user_access_tokens 
ADD CONSTRAINT user_access_tokens_token_type_check 
CHECK (token_type IN ('activation', 'password_reset', 'temporary_access'));