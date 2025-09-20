-- Make Kevin Enassee the owner of Courtscapes business
-- Update his role from admin to owner

UPDATE company_members 
SET role = 'owner', updated_at = now()
WHERE company_id = 'df0df659-7e4c-41c4-a028-495539a0b556' 
AND user_id = '5213f4be-54a3-4985-a88e-e460154e52fd' 
AND role = 'admin';