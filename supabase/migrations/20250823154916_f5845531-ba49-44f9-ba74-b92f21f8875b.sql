-- Update stakeholder data to use the active company ID from the console logs
-- The user's active company ID from console logs is: 4042458b-8e95-4842-90d9-29f43815ecf8

DO $$
DECLARE
    target_company_id UUID := '4042458b-8e95-4842-90d9-29f43815ecf8';
BEGIN
    -- Update all existing stakeholders to use the correct company ID
    UPDATE public.stakeholders 
    SET company_id = target_company_id
    WHERE display_name IN (
        'Advance Building Strategies',
        'ASA Building Consultants', 
        'Green Choice',
        'The Urban Leaf',
        'Energy Rating Melbourne',
        'A Line Surveying',
        'Victorian Survey Group',
        'Indepth Geotech & Design',
        'Professional Geotechnical Services'
    );

    -- Log the number of updated records
    RAISE NOTICE 'Updated % stakeholder records to use company ID: %', 
        (SELECT COUNT(*) FROM public.stakeholders WHERE company_id = target_company_id),
        target_company_id;
END $$;