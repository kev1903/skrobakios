import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Calendar, User, Clock, FileText, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from './TaskContext';

import { useDigitalObjectsContext } from '@/contexts/DigitalObjectsContext';
interface TaskEditFormProps {
  task: Task;
  onFieldChange: (field: keyof Task, value: any) => void;
  projectId?: string;
}
export const TaskEditForm = ({
  task,
  onFieldChange,
  projectId
 }: TaskEditFormProps) => {
  // Simplified - no team member assignments
  const teamMembers: any[] = [];
  const { digitalObjects } = useDigitalObjectsContext();
  const [digitalObjectOpen, setDigitalObjectOpen] = useState(false);
  const [expectedTimeValue, setExpectedTimeValue] = useState('');
  const [expectedTimeUnit, setExpectedTimeUnit] = useState<'minutes' | 'days'>('days');

  // Initialize expected time from task duration
  useEffect(() => {
    if (task.duration) {
      // Assume task.duration is in days, convert if less than 1 day to minutes
      if (task.duration < 1) {
        setExpectedTimeValue((task.duration * 24 * 60).toString());
        setExpectedTimeUnit('minutes');
      } else {
        setExpectedTimeValue(task.duration.toString());
        setExpectedTimeUnit('days');
      }
    } else {
      setExpectedTimeValue('');
    }
  }, [task.duration]);

  const handleExpectedTimeChange = (value: string, unit: 'minutes' | 'days') => {
    const numValue = parseFloat(value) || 0;
    let durationInDays = numValue;
    
    if (unit === 'minutes') {
      durationInDays = numValue / (24 * 60); // Convert minutes to days
    }
    
    onFieldChange('duration', durationInDays);
    setExpectedTimeValue(value);
    setExpectedTimeUnit(unit);
  };

  const handleAssigneeChange = (memberName: string) => {
    if (memberName === 'unassigned') {
      onFieldChange('assignedTo', {
        name: '',
        avatar: ''
      });
    } else {
      onFieldChange('assignedTo', {
        name: '',
        avatar: ''
      });
    }
  };
  return <div className="space-y-6 mt-6">
      {/* Digital Object Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Digital Object
        </label>
        <Popover open={digitalObjectOpen} onOpenChange={setDigitalObjectOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={digitalObjectOpen}
              className="w-full justify-between"
            >
              {task.digital_object_id
                ? digitalObjects.find((obj) => obj.id === task.digital_object_id)?.name || "Select digital object..."
                : "Select digital object..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 z-50 bg-white border border-gray-200 shadow-lg">
            <Command>
              <CommandInput placeholder="Search digital objects..." />
              <CommandList>
                <CommandEmpty>No digital object found.</CommandEmpty>
                <CommandGroup>
                  {digitalObjects.map((obj) => (
                    <CommandItem
                      key={obj.id}
                      value={`${obj.name} ${obj.stage}`}
                      onSelect={() => {
                        onFieldChange('digital_object_id', obj.id);
                        setDigitalObjectOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          task.digital_object_id === obj.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{obj.name}</span>
                        <span className="text-xs text-muted-foreground">{obj.stage}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Assignee Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Assignee
        </label>
        <Select value={task.assignedTo.name || 'unassigned'} onValueChange={handleAssigneeChange}>
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignedTo.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignedTo.name ? task.assignedTo.name.split(' ').map(n => n[0]).join('') : '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignedTo.name || 'Unassigned'}</span>
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
            {/* No team members available */}
          </SelectContent>
        </Select>
      </div>

      {/* Status and Priority side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Flag className="w-4 h-4 mr-2" />
            Status
          </label>
          <Select value={task.status} onValueChange={(value) => onFieldChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Flag className="w-4 h-4 mr-2" />
            Priority
          </label>
          <Select value={task.priority} onValueChange={(value) => onFieldChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date and Duration side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Due Date
          </label>
          <Input type="date" value={task.dueDate} onChange={e => onFieldChange('dueDate', e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Expected Time
          </label>
          <div className="flex space-x-2">
            <Input 
              type="number" 
              value={expectedTimeValue} 
              onChange={e => handleExpectedTimeChange(e.target.value, expectedTimeUnit)} 
              placeholder="0"
              min="0"
              step="1"
              className="flex-1"
            />
            <Select value={expectedTimeUnit} onValueChange={(value: 'minutes' | 'days') => handleExpectedTimeChange(expectedTimeValue, value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">min</SelectItem>
                <SelectItem value="days">days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea value={task.description || ''} onChange={e => onFieldChange('description', e.target.value)} placeholder="What is this task about?" className="min-h-[100px]" />
      </div>
    </div>;
};