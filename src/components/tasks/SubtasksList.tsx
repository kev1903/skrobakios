
import React, { useState } from 'react';
import { Plus, Check, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Task } from './TaskContext';

interface Subtask {
  id: string;
  title: string;
  assignedTo: { name: string; avatar: string };
  dueDate: string;
  completed: boolean;
}

interface SubtasksListProps {
  taskId: string;
  projectMembers: Array<{ name: string; avatar: string }>;
}

export const SubtasksList = ({ taskId, projectMembers }: SubtasksListProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    {
      id: 'st1',
      title: 'Pre-Inspection Clearance',
      assignedTo: { name: 'John Smith', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
      dueDate: '2024-07-12',
      completed: false
    },
    {
      id: 'st2',
      title: 'Manufacturer\'s details of the roof trusses',
      assignedTo: { name: 'Sarah Wilson', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
      dueDate: '2024-07-15',
      completed: true
    }
  ]);
  
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
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
      setSubtasks([...subtasks, subtask]);
      setNewSubtask({
        title: '',
        assignedTo: projectMembers[0] || { name: '', avatar: '' },
        dueDate: ''
      });
      setIsAddingSubtask(false);
    }
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsAddingSubtask(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subtask
        </Button>
      </div>

      <div className="space-y-3">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center space-x-3 p-3 border rounded-lg">
            <button
              onClick={() => toggleSubtaskComplete(subtask.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                subtask.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {subtask.completed && <Check className="w-3 h-3" />}
            </button>
            
            <div className="flex-1">
              <p className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                {subtask.title}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={subtask.assignedTo.avatar} />
                    <AvatarFallback className="text-xs">
                      {subtask.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{subtask.assignedTo.name}</span>
                </div>
                {subtask.dueDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{subtask.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
            
            {subtask.completed && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Completed
              </Badge>
            )}
          </div>
        ))}
      </div>

      {isAddingSubtask && (
        <div className="p-4 border rounded-lg bg-gray-50">
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
                onClick={() => setIsAddingSubtask(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
