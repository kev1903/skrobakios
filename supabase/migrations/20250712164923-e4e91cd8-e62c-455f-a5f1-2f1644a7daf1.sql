-- Initialize modules for all existing companies
DO $$
DECLARE
    company_record RECORD;
BEGIN
    -- Loop through all existing companies and initialize their modules
    FOR company_record IN SELECT id FROM public.companies LOOP
        PERFORM public.initialize_company_modules(company_record.id);
    END LOOP;
END $$;