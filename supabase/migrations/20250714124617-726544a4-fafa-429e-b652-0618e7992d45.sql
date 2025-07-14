-- Update existing company names to use "Business" instead of "Company"
UPDATE public.companies 
SET name = REPLACE(name, ' Company', ' Business')
WHERE name LIKE '%''s Company';

-- Also update company names that might end with just "Company"
UPDATE public.companies 
SET name = REPLACE(name, ' Company', ' Business')
WHERE name LIKE '% Company' AND name NOT LIKE '%''s Business';