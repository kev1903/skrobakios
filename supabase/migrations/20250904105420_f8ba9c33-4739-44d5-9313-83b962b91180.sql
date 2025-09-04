-- Verify the security fix - check current policies on stakeholder_contacts table
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'stakeholder_contacts'
ORDER BY policyname;