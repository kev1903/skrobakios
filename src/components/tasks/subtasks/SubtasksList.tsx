import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubtaskItem } from './SubtaskItem';
import { AddSubtaskForm } from './AddSubtaskForm';
import { Subtask, SubtasksListProps } from './types';

export const SubtasksList = ({ taskId, projectMembers, onSubtaskClick }: SubtasksListProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleAddSubtask = (subtask: Subtask) => {
    setSubtasks([...subtasks, subtask]);
    setIsAddingSubtask(false);
  };

  const toggleSubtaskComplete = (subtaskId: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Subtasks</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddingSubtask(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add subtask
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Draft subtasks
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onToggleComplete={toggleSubtaskComplete}
            onSubtaskClick={onSubtaskClick}
          />
        ))}
      </div>

      {isAddingSubtask && (
        <AddSubtaskForm
          projectMembers={projectMembers}
          onAddSubtask={handleAddSubtask}
          onCancel={() => setIsAddingSubtask(false)}
        />
      )}
    </div>
  );
};