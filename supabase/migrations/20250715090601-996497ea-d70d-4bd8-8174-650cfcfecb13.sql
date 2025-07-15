-- Disable Free and Basic subscription plans
UPDATE subscription_plans 
SET is_active = false
WHERE name IN ('Free', 'Basic');