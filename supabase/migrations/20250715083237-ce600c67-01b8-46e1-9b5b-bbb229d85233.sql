-- Update existing subscription plans to rename Professional to Project Management and Enterprise to Business Management
UPDATE subscription_plans 
SET name = 'Project Management'
WHERE name = 'Professional';

UPDATE subscription_plans 
SET name = 'Business Management'
WHERE name = 'Enterprise';

-- Also update the description if needed
UPDATE subscription_plans 
SET description = 'Complete project management solution with advanced features'
WHERE name = 'Project Management';

UPDATE subscription_plans 
SET description = 'Comprehensive business management suite for large organizations'
WHERE name = 'Business Management';