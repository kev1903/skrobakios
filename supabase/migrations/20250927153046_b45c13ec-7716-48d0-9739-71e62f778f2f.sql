-- Phase 1: Database Integration & Relationship Setup

-- Add WBS-Task linking fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN wbs_item_id UUID REFERENCES public.wbs_items(id) ON DELETE SET NULL;

-- Add task linking fields to wbs_items table
ALTER TABLE public.wbs_items 
ADD COLUMN linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN is_task_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN task_conversion_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX idx_tasks_wbs_item_id ON public.tasks(wbs_item_id);
CREATE INDEX idx_wbs_items_linked_task_id ON public.wbs_items(linked_task_id);
CREATE INDEX idx_wbs_items_is_task_enabled ON public.wbs_items(is_task_enabled);

-- Function to sync WBS progress with linked task progress
CREATE OR REPLACE FUNCTION public.sync_wbs_task_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- When task progress changes, update linked WBS item
  IF TG_TABLE_NAME = 'tasks' AND NEW.wbs_item_id IS NOT NULL THEN
    UPDATE public.wbs_items 
    SET 
      progress = NEW.progress,
      status = CASE 
        WHEN NEW.status = 'completed' THEN 'Completed'
        WHEN NEW.status = 'in_progress' THEN 'In Progress'
        WHEN NEW.status = 'not_started' THEN 'Not Started'
        WHEN NEW.status = 'on_hold' THEN 'On Hold'
        ELSE 'Not Started'
      END,
      assigned_to = NEW.assigned_to,
      updated_at = NOW()
    WHERE id = NEW.wbs_item_id;
  END IF;

  -- When WBS progress changes, update linked task
  IF TG_TABLE_NAME = 'wbs_items' AND NEW.linked_task_id IS NOT NULL THEN
    UPDATE public.tasks 
    SET 
      progress = NEW.progress,
      status = CASE 
        WHEN NEW.status = 'Completed' THEN 'completed'
        WHEN NEW.status = 'In Progress' THEN 'in_progress'
        WHEN NEW.status = 'Not Started' THEN 'not_started'
        WHEN NEW.status = 'On Hold' THEN 'on_hold'
        ELSE 'not_started'
      END,
      assigned_to = NEW.assigned_to,
      updated_at = NOW()
    WHERE id = NEW.linked_task_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for bidirectional sync
CREATE TRIGGER sync_task_to_wbs_progress
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wbs_task_progress();

CREATE TRIGGER sync_wbs_to_task_progress
  AFTER UPDATE ON public.wbs_items
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wbs_task_progress();