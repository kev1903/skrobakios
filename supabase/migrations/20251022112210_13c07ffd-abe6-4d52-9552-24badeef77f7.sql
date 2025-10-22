-- Fix security issue: Set search_path for the notification function
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assigned_user_id UUID;
BEGIN
  -- Get the user_id from the assigned_to_user_id field
  assigned_user_id := NEW.assigned_to_user_id;
  
  -- Only create notification if there's a valid user_id and task is being newly assigned or reassigned
  IF assigned_user_id IS NOT NULL THEN
    -- Check if this is a new assignment (INSERT or UPDATE with different assigned user)
    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND (OLD.assigned_to_user_id IS NULL OR OLD.assigned_to_user_id != NEW.assigned_to_user_id)) THEN
      
      -- Insert notification
      INSERT INTO public.notifications (
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        assigned_user_id,
        'New Task Assigned',
        'You have been assigned to task: ' || NEW.task_name,
        'task_assignment',
        false,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Notification created for user % for task %', assigned_user_id, NEW.task_name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;