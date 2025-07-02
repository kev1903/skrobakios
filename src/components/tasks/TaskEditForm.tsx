
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Tag, FileText } from 'lucide-react';
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
    const member = members.find(m => m.name === memberName);
    if (member) {
      onFieldChange('assignedTo', { name: member.name, avatar: member.avatar });
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
            <SelectItem value="">
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

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Priority
        </label>
        <Select
          value={task.priority}
          onValueChange={(value) => onFieldChange('priority', value as 'High' | 'Medium' | 'Low')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Status
        </label>
        <Select
          value={task.status}
          onValueChange={(value) => onFieldChange('status', value as Task['status'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Progress ({task.progress}%)
        </label>
        <Input
          type="range"
          min="0"
          max="100"
          value={task.progress}
          onChange={(e) => onFieldChange('progress', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
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

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Category
        </label>
        <Input
          value={task.category || ''}
          onChange={(e) => onFieldChange('category', e.target.value)}
          placeholder="Enter category..."
        />
      </div>
    </div>
  );
};
