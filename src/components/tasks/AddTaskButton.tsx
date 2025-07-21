
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddTaskButtonProps {
  onAddTask: () => void;
}

export const AddTaskButton = ({ onAddTask }: AddTaskButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onAddTask}
      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 border-2 border-dashed border-border hover:border-muted-foreground transition-colors"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add task
    </Button>
  );
};
