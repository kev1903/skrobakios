import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubtaskItem } from './SubtaskItem';
import { AddSubtaskForm } from './AddSubtaskForm';
import { Subtask, SubtasksListProps } from './types';
import { useSubtasks } from '@/hooks/useSubtasks';

export const SubtasksList = ({ taskId, projectMembers, onSubtaskClick }: SubtasksListProps) => {
  const { subtasks, loading, addSubtask, updateSubtask, deleteSubtask } = useSubtasks(taskId);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleAddSubtask = async (title: string, assignedMember: { name: string; avatar: string }, dueDate: string) => {
    try {
      await addSubtask({
        parent_task_id: taskId,
        title,
        assigned_to_name: assignedMember.name,
        assigned_to_avatar: assignedMember.avatar,
        due_date: dueDate || undefined,
        completed: false
      });
      setIsAddingSubtask(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const toggleSubtaskComplete = async (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      try {
        await updateSubtask(subtaskId, { completed: !subtask.completed });
      } catch (error) {
        console.error('Failed to update subtask:', error);
      }
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {subtasks.filter(st => st.completed).length} of {subtasks.length} completed
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsAddingSubtask(true)}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onToggleComplete={toggleSubtaskComplete}
            onSubtaskClick={onSubtaskClick}
            onDelete={handleDeleteSubtask}
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