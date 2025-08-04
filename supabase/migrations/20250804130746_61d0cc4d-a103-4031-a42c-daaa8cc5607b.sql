-- Function to copy Monday time blocks to Tuesday through Friday
CREATE OR REPLACE FUNCTION copy_monday_blocks_to_weekdays(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  monday_block RECORD;
  new_day INTEGER;
BEGIN
  -- Loop through each Monday time block for the user
  FOR monday_block IN 
    SELECT * FROM time_blocks 
    WHERE user_id = target_user_id AND day_of_week = 1
  LOOP
    -- Copy to Tuesday (2), Wednesday (3), Thursday (4), Friday (5)
    FOR new_day IN 2..5 LOOP
      -- Delete existing blocks for this day first
      DELETE FROM time_blocks 
      WHERE user_id = target_user_id AND day_of_week = new_day;
      
      -- Insert copy of Monday block
      INSERT INTO time_blocks (
        user_id, day_of_week, start_time, end_time, 
        title, description, category, color
      ) VALUES (
        target_user_id, new_day, monday_block.start_time, monday_block.end_time,
        monday_block.title, monday_block.description, monday_block.category, monday_block.color
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Function to copy current user's Monday blocks (for use from frontend)
CREATE OR REPLACE FUNCTION copy_my_monday_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM copy_monday_blocks_to_weekdays(auth.uid());
END;
$$;