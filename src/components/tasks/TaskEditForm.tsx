
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, FileText } from 'lucide-react';
import { Task } from './TaskContext';
import { useProjectMembers } from '@/hooks/useProjectMembers';

interface TaskEditFormProps {
  task: Task;
  onFieldChange: (field: keyof Task, value: any) => void;
  projectId?: string;
}

export const TaskEditForm = ({ task, onFieldChange, projectId }: TaskEditFormProps) => {
  const { members } = useProjectMembers(projectId);

  const handleAssigneeChange = (memberName: string) => {
    if (memberName === 'unassigned') {
      onFieldChange('assignedTo', { name: 'Unassigned', avatar: '' });
    } else {
      const member = members.find(m => m.name === memberName);
      if (member) {
        onFieldChange('assignedTo', { name: member.name, avatar: member.avatar });
      }
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Task Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Task Name
        </label>
        <Input
          value={task.taskName}
          onChange={(e) => onFieldChange('taskName', e.target.value)}
          placeholder="Enter task name..."
        />
      </div>

      {/* Assignee Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Assignee
        </label>
        <Select
          value={task.assignedTo.name}
          onValueChange={handleAssigneeChange}
        >
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignedTo.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignedTo.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
            <SelectItem value="unassigned">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gray-200">?</AvatarFallback>
                </Avatar>
                <span>Unassigned</span>
              </div>
            </SelectItem>
            {members.map((member) => (
              <SelectItem key={member.email} value={member.name}>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Due Date
        </label>
        <Input
          type="date"
          value={task.dueDate}
          onChange={(e) => onFieldChange('dueDate', e.target.value)}
        />
      </div>


      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          value={task.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="What is this task about?"
          className="min-h-[100px]"
        />
      </div>

    </div>
  );
};
