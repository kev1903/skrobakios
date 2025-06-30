
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface TaskCardEditorProps {
  taskTitle: string;
  onTaskTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
}

export const TaskCardEditor = ({ 
  taskTitle, 
  onTaskTitleChange, 
  onSave, 
  onCancel, 
  onKeyPress, 
  onBlur 
}: TaskCardEditorProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={taskTitle}
              onChange={(e) => onTaskTitleChange(e.target.value)}
              placeholder="Enter task title..."
              className="text-sm"
              autoFocus
              onKeyDown={onKeyPress}
              onBlur={onBlur}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSave}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
