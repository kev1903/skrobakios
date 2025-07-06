import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subtask } from './types';

interface AddSubtaskFormProps {
  projectMembers: Array<{ name: string; avatar: string }>;
  onAddSubtask: (subtask: Subtask) => void;
  onCancel: () => void;
}

export const AddSubtaskForm = ({ projectMembers, onAddSubtask, onCancel }: AddSubtaskFormProps) => {
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    assignedTo: projectMembers[0] || { name: '', avatar: '' },
    dueDate: ''
  });

  const handleAddSubtask = () => {
    if (newSubtask.title.trim()) {
      const subtask: Subtask = {
        id: `st${Date.now()}`,
        title: newSubtask.title,
        assignedTo: newSubtask.assignedTo,
        dueDate: newSubtask.dueDate,
        completed: false
      };
      onAddSubtask(subtask);
      setNewSubtask({
        title: '',
        assignedTo: projectMembers[0] || { name: '', avatar: '' },
        dueDate: ''
      });
      onCancel();
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="space-y-3">
        <Input
          placeholder="Subtask title"
          value={newSubtask.title}
          onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Assign to
            </label>
            <Select
              value={newSubtask.assignedTo.name}
              onValueChange={(value) => {
                const member = projectMembers.find(m => m.name === value);
                if (member) {
                  setNewSubtask({ ...newSubtask, assignedTo: member });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectMembers.map((member) => (
                  <SelectItem key={member.name} value={member.name}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Due Date
            </label>
            <Input
              type="date"
              value={newSubtask.dueDate}
              onChange={(e) => setNewSubtask({ ...newSubtask, dueDate: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleAddSubtask} size="sm">
            Add Subtask
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};