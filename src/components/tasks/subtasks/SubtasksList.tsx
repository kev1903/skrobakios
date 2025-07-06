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