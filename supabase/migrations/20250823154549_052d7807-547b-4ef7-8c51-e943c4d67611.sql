-- Insert sample stakeholder data from the uploaded image
-- Note: This assumes a company_id exists. You'll need to replace 'your-company-id-here' with an actual company ID

-- First, let's create a sample company if one doesn't exist for demo purposes
DO $$
DECLARE
    sample_company_id UUID;
BEGIN
    -- Try to get an existing company ID
    SELECT id INTO sample_company_id FROM public.companies LIMIT 1;
    
    -- If no company exists, create a sample one
    IF sample_company_id IS NULL THEN
        INSERT INTO public.companies (id, name, slug, status)
        VALUES (gen_random_uuid(), 'Sample Company', 'sample-company', 'active')
        RETURNING id INTO sample_company_id;
    END IF;

    -- Insert Building Surveyors
    INSERT INTO public.stakeholders (
        company_id, display_name, category, trade_industry, 
        primary_contact_name, primary_email, primary_phone, 
        status, compliance_status, tags
    ) VALUES 
    (sample_company_id, 'Advance Building Strategies', 'consultant', 'Building Surveyor', 
     'Permits Department', 'permits@buildingstrategies.com.au', '8585 3800', 
     'active', 'valid', ARRAY['building-surveyor', 'permits']),
    (sample_company_id, 'ASA Building Consultants', 'consultant', 'Building Surveyor', 
     'Consultant', 'consult@asabc.com.au', '03 9571 3068', 
     'active', 'valid', ARRAY['building-surveyor', 'consultants']);

    -- Insert Energy Consultants  
    INSERT INTO public.stakeholders (
        company_id, display_name, category, trade_industry, 
        primary_contact_name, primary_email, primary_phone, 
        status, compliance_status, tags
    ) VALUES 
    (sample_company_id, 'Green Choice', 'consultant', 'Energy Consultant', 
     'Energy Team', 'Energy@greenchoiceconsulting.com.au', '1300 864 944', 
     'active', 'valid', ARRAY['energy-consultant', 'sustainability']),
    (sample_company_id, 'The Urban Leaf', 'consultant', 'Energy Consultant', 
     'Energy Team', 'energy@tul.net.au', '03 88 99 6149', 
     'active', 'valid', ARRAY['energy-consultant', 'urban-planning']),
    (sample_company_id, 'Energy Rating Melbourne', 'consultant', 'Energy Consultant', 
     'Info Team', 'info@energyratingmelbourne.com.au', '0412 690 537', 
     'active', 'valid', ARRAY['energy-consultant', 'rating']);

    -- Insert Surveying Companies
    INSERT INTO public.stakeholders (
        company_id, display_name, category, trade_industry, 
        primary_contact_name, primary_email, primary_phone, 
        status, compliance_status, tags
    ) VALUES 
    (sample_company_id, 'A Line Surveying', 'consultant', 'Surveying', 
     'Admin Team', 'admin@alinesurveying.com.au', '9870 6443', 
     'active', 'valid', ARRAY['surveying', 'land-surveyor']),
    (sample_company_id, 'Victorian Survey Group', 'consultant', 'Surveying', 
     'Admin Team', 'admin@vsg.net.au', '03 9877 4229', 
     'active', 'valid', ARRAY['surveying', 'victoria']);

    -- Insert Soil Investigation Companies
    INSERT INTO public.stakeholders (
        company_id, display_name, category, trade_industry, 
        primary_contact_name, primary_email, primary_phone, 
        status, compliance_status, tags
    ) VALUES 
    (sample_company_id, 'Indepth Geotech & Design', 'consultant', 'Soil Investigation', 
     'Admin Team', 'admin@indepthgeotech.com.au', '0439 030 004', 
     'active', 'valid', ARRAY['geotechnical', 'soil-investigation']),
    (sample_company_id, 'Professional Geotechnical Services', 'consultant', 'Soil Investigation', 
     'Info Team', 'info@progeoservices.com.au', '0412 343 549', 
     'active', 'valid', ARRAY['geotechnical', 'soil-investigation']);

END $$;

-- Insert addresses for the stakeholders
DO $$
DECLARE
    stakeholder_record RECORD;
BEGIN
    -- Add addresses for stakeholders where address information is available
    
    -- Advance Building Strategies
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'Advance Building Strategies';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', 'Suite 3/55-57 Wangara Road', 'Cheltenham', 'VIC', '3192', 'Australia', true);
    END IF;

    -- ASA Building Consultants
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'ASA Building Consultants';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', '67 Rosstown Road', 'Carnegie', 'VIC', '3163', 'Australia', true);
    END IF;

    -- The Urban Leaf
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'The Urban Leaf';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', 'L2, 433-435 South Rd', 'Bentleigh', 'VIC', '3204', 'Australia', true);
    END IF;

    -- A Line Surveying
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'A Line Surveying';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', '109 Bedford Road East', 'Ringwood', 'VIC', '3135', 'Australia', true);
    END IF;

    -- Victorian Survey Group
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'Victorian Survey Group';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', '68b South Parade', 'Blackburn', 'VIC', '3130', 'Australia', true);
    END IF;

    -- Indepth Geotech & Design
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'Indepth Geotech & Design';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', 'Croydon Business District', 'Croydon', 'VIC', '3136', 'Australia', true);
    END IF;

    -- Professional Geotechnical Services
    SELECT id INTO stakeholder_record FROM public.stakeholders WHERE display_name = 'Professional Geotechnical Services';
    IF FOUND THEN
        INSERT INTO public.stakeholder_addresses (
            stakeholder_id, type, address_line_1, city, state, postal_code, country, is_primary
        ) VALUES 
        (stakeholder_record.id, 'head_office', '41 Old Warrandyte Road', 'Donvale', 'VIC', '3111', 'Australia', true);
    END IF;

END $$;