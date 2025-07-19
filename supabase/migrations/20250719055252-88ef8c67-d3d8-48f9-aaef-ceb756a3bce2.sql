-- Create function to update activity numbering based on hierarchy and position
CREATE OR REPLACE FUNCTION update_activity_numbering()
RETURNS TRIGGER AS $$
DECLARE
    parent_stage_number TEXT;
    parent_base_number INTEGER;
    child_counter INTEGER;
    activity_record RECORD;
BEGIN
    -- Update numbering for all activities in the affected project/company
    FOR activity_record IN 
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
            WHERE project_id = activity_record.project_id 
            AND company_id = activity_record.company_id
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
            WHERE project_id = activity_record.project_id 
            AND company_id = activity_record.company_id
            AND parent_id IS NULL
            ORDER BY sort_order, created_at
        LOOP
            child_counter := 1;
            
            -- Update child activities under this parent
            FOR activity_record IN
                SELECT a.id, a.name, p.name as parent_name
                FROM activities a
                JOIN activities p ON a.parent_id = p.id
                WHERE a.project_id = activity_record.project_id
                AND a.company_id = activity_record.company_id
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
                WHERE id = activity_record.id;
                
                child_counter := child_counter + 1;
            END LOOP;
        END LOOP;
    END LOOP;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
CREATE OR REPLACE TRIGGER trigger_update_activity_numbering_insert
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_numbering();

-- Create trigger for UPDATE operations (when sort_order or parent_id changes)
CREATE OR REPLACE TRIGGER trigger_update_activity_numbering_update
    AFTER UPDATE OF sort_order, parent_id ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_numbering();

-- Create trigger for DELETE operations
CREATE OR REPLACE TRIGGER trigger_update_activity_numbering_delete
    AFTER DELETE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_numbering();