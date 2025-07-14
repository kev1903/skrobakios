-- Remove avatar_url from all user profiles
UPDATE public.profiles 
SET avatar_url = NULL, 
    updated_at = now()
WHERE avatar_url IS NOT NULL;