
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
      className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-white/50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add task
    </Button>
  );
};
