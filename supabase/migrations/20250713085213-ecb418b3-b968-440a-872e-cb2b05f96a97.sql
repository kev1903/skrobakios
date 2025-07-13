-- Check current constraints on user_access_tokens table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_access_tokens'::regclass;

-- Check if there's a constraint on token_type
\d user_access_tokens