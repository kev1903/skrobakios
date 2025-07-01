import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { AddTaskButton } from './AddTaskButton';

interface TaskListControlsProps {
  onAddTask: () => void;
  isMobile?: boolean;
}

export const TaskListControls = ({ onAddTask, isMobile = false }: TaskListControlsProps) => {
  if (isMobile) {
    return (
      <div className="mb-4">
        <AddTaskButton onAddTask={onAddTask} />
      </div>
    );
  }

  return (
    <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={onAddTask}>
      <TableCell colSpan={9} className="p-4">
        <AddTaskButton onAddTask={onAddTask} />
      </TableCell>
    </TableRow>
  );
};