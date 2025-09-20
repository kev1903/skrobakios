-- Delete duplicate Ardelle companies that have no members
-- Keep the one with company_id: 474effb0-2704-4098-81b2-82d9c44eaf6b (has owner member)
-- Delete the empty duplicates

-- Delete first duplicate (oldest, no onboarding)
DELETE FROM companies 
WHERE id = 'd7bef05e-f605-475b-96d2-6f6926fb4fe1' 
AND name = 'Ardelle';

-- Delete second duplicate (no members)  
DELETE FROM companies 
WHERE id = '2793d673-bcc0-45f5-909d-2ff131d43b90' 
AND name = 'Ardelle';