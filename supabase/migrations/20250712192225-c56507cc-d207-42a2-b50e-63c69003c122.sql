-- Step 1: Add new enum values to the existing enum
ALTER TYPE app_role ADD VALUE 'platform_admin';
ALTER TYPE app_role ADD VALUE 'company_admin';