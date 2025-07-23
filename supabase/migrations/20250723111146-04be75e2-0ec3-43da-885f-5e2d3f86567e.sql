-- Update the check constraint to include 'invitation' as a valid token type
ALTER TABLE user_access_tokens 
DROP CONSTRAINT user_access_tokens_token_type_check;

ALTER TABLE user_access_tokens 
ADD CONSTRAINT user_access_tokens_token_type_check 
CHECK (token_type = ANY (ARRAY['activation'::text, 'password_reset'::text, 'temporary_access'::text, 'invitation'::text]));