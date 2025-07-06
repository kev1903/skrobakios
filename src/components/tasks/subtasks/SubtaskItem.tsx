import React from 'react';
import { Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Subtask } from './types';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggleComplete: (subtaskId: string) => void;
  onSubtaskClick?: (subtask: Subtask) => void;
}

export const SubtaskItem = ({ subtask, onToggleComplete, onSubtaskClick }: SubtaskItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div 
      key={subtask.id} 
      className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => onSubtaskClick?.(subtask)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(subtask.id);
        }}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          subtask.completed 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {subtask.completed && <Check className="w-2.5 h-2.5" />}
      </button>
    
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}>
          {subtask.title}
        </p>
      </div>
      
      <div className="flex items-center space-x-3 flex-shrink-0">
        {subtask.dueDate && (
          <span className="text-xs text-gray-600 font-medium">
            {formatDate(subtask.dueDate)}
          </span>
        )}
        <Avatar className="w-6 h-6">
          <AvatarImage src={subtask.assignedTo.avatar} />
          <AvatarFallback className="text-xs">
            {subtask.assignedTo.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};