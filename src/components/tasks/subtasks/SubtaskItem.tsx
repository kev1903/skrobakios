import React from 'react';
import { Check, MoreVertical, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Subtask } from './types';
import { SubtaskSubmittal } from './SubtaskSubmittal';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggleComplete: (subtaskId: string) => void;
  onSubtaskClick?: (subtask: Subtask) => void;
  onDelete: (subtaskId: string) => void;
}

export const SubtaskItem = ({ subtask, onToggleComplete, onSubtaskClick, onDelete }: SubtaskItemProps) => {
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
      className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors group"
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
    
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onSubtaskClick?.(subtask)}
      >
        <p className={`text-sm font-medium truncate ${
          subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}>
          {subtask.title}
        </p>
        {subtask.description && (
          <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-3 flex-shrink-0">
        {subtask.due_date && (
          <span className="text-xs text-gray-600 font-medium">
            {formatDate(subtask.due_date)}
          </span>
        )}
        {subtask.assigned_to_name && (
          <Avatar className="w-6 h-6">
            <AvatarImage src={subtask.assigned_to_avatar} />
            <AvatarFallback className="text-xs">
              {subtask.assigned_to_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Submittal indicator */}
        <SubtaskSubmittal 
          subtaskId={subtask.id}
          subtaskTitle={subtask.title}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDelete(subtask.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};