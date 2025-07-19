CREATE OR REPLACE FUNCTION public.update_activity_numbering()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    parent_stage_number TEXT;
    parent_base_number INTEGER;
    child_counter INTEGER;
    project_company_record RECORD;
    child_activity_record RECORD;
BEGIN
    -- Update numbering for all activities in the affected project/company
    FOR project_company_record IN 
        SELECT DISTINCT a1.project_id, a1.company_id 
        FROM activities a1 
        WHERE a1.project_id = COALESCE(NEW.project_id, OLD.project_id) 
        AND a1.company_id = COALESCE(NEW.company_id, OLD.company_id)
    LOOP
        -- First, update parent activities (those without parent_id)
        WITH numbered_parents AS (
            SELECT 
                id,
                ROW_NUMBER() OVER (ORDER BY sort_order, created_at) as rn
            FROM activities 
            WHERE project_id = project_company_record.project_id 
            AND company_id = project_company_record.company_id
            AND parent_id IS NULL
            ORDER BY sort_order, created_at
        )
        UPDATE activities 
        SET name = CASE 
            WHEN name ~ '^[0-9]+\.[0-9]+\s+' THEN
                (rn || '.1 ' || REGEXP_REPLACE(name, '^[0-9]+\.[0-9]+\s+', ''))
            WHEN name ~ '^[0-9]+\.\s+' THEN
                (rn || '.1 ' || REGEXP_REPLACE(name, '^[0-9]+\.\s+', ''))
            ELSE
                (rn || '.1 ' || name)
        END
        FROM numbered_parents
        WHERE activities.id = numbered_parents.id;

        -- Then, update child activities for each parent
        FOR parent_stage_number, parent_base_number IN
            SELECT 
                SPLIT_PART(name, ' ', 1) as stage_num,
                CAST(SPLIT_PART(SPLIT_PART(name, '.', 1), ' ', 1) AS INTEGER) as base_num
            FROM activities 
            WHERE project_id = project_company_record.project_id 
            AND company_id = project_company_record.company_id
            AND parent_id IS NULL
            ORDER BY sort_order, created_at
        LOOP
            child_counter := 1;
            
            -- Update child activities under this parent
            FOR child_activity_record IN
                SELECT a.id, a.name, p.name as parent_name
                FROM activities a
                JOIN activities p ON a.parent_id = p.id
                WHERE a.project_id = project_company_record.project_id
                AND a.company_id = project_company_record.company_id
                AND p.name LIKE parent_stage_number || '%'
                ORDER BY a.sort_order, a.created_at
            LOOP
                UPDATE activities 
                SET name = CASE 
                    WHEN name ~ '^[0-9]+\.[0-9]+\s+' THEN
                        (parent_base_number || '.' || child_counter || ' ' || REGEXP_REPLACE(name, '^[0-9]+\.[0-9]+\s+', ''))
                    WHEN name ~ '^[0-9]+\.\s+' THEN
                        (parent_base_number || '.' || child_counter || ' ' || REGEXP_REPLACE(name, '^[0-9]+\.\s+', ''))
                    ELSE
                        (parent_base_number || '.' || child_counter || ' ' || name)
                END
                WHERE id = child_activity_record.id;
                
                child_counter := child_counter + 1;
            END LOOP;
        END LOOP;
    END LOOP;

    RETURN COALESCE(NEW, OLD);
END;
$function$