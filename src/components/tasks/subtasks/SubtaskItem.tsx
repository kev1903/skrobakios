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
      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent/50 transition-colors group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(subtask.id);
        }}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
          subtask.completed 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-muted-foreground/40 hover:border-primary'
        }`}
      >
        {subtask.completed && <Check className="w-3 h-3" />}
      </button>
    
      <div 
        className="flex-1 min-w-0 cursor-pointer flex items-center gap-2"
        onClick={() => onSubtaskClick?.(subtask)}
      >
        <span className={`text-sm truncate ${
          subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}>
          {subtask.title}
        </span>
        {subtask.due_date && (
          <span className="text-xs text-muted-foreground">
            {formatDate(subtask.due_date)}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {subtask.assigned_to_name && (
          <Avatar className="w-5 h-5">
            <AvatarImage src={subtask.assigned_to_avatar} />
            <AvatarFallback className="text-[10px]">
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
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDelete(subtask.id)} className="text-destructive text-xs">
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};