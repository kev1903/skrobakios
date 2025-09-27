import React, { useState, useEffect } from 'react';
import { Task } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Clock, AlertCircle, CheckCircle2, X, Edit2, Save, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { WBSTaskConversionService } from '@/services/wbsTaskConversionService';
import { taskService } from './taskService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

interface TaskDetailPanelProps {
  task: any | null; // Use any for now to avoid interface conflicts
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: (taskId: string, updates: Partial<any>) => void;
  wbsItemId?: string; // If this task is linked to a WBS item
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
  wbsItemId
}) => {
  const { userProfile } = useUserProfile();
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setEditingTask({ ...task });
      setIsEditing(false);
    }
  }, [task, isOpen]);

  if (!task || !isOpen) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingTask(task ? { ...task } : null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editingTask || !userProfile) return;

    setIsLoading(true);
    try {
      await taskService.updateTask(editingTask.id, {
        taskName: editingTask.taskName || editingTask.name,
        description: editingTask.description,
        taskType: editingTask.taskType || editingTask.type,
        priority: editingTask.priority,
        status: editingTask.status,
        progress: editingTask.progress,
        dueDate: editingTask.dueDate || editingTask.due_date,
        assignedTo: editingTask.assignedTo || editingTask.assigned_to,
      }, userProfile);

      onTaskUpdate?.(editingTask.id, editingTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editingTask) return;
    setEditingTask({ ...editingTask, [field]: value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Task Details</h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
                <RotateCcw className="w-4 h-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4" />
                Save
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {wbsItemId && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                This task is linked to WBS Activity
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              {isEditing ? (
                <Input
                  id="task-name"
                  value={editingTask?.task_name || editingTask?.name || ''}
                  onChange={(e) => handleFieldChange('task_name', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700">{task.task_name || task.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="task-description"
                  value={editingTask?.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-700">{task.description || 'No description'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                {isEditing ? (
                  <Select value={editingTask?.task_type || editingTask?.type || ''} onValueChange={(value) => handleFieldChange('task_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1 text-sm text-gray-700">{task.task_type || task.type}</p>
                )}
              </div>

              <div>
                <Label>Priority</Label>
                {isEditing ? (
                  <Select value={editingTask?.priority || ''} onValueChange={(value) => handleFieldChange('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status & Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              {isEditing ? (
                <Select value={editingTask?.status || ''} onValueChange={(value) => handleFieldChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
              )}
            </div>

            <div>
              <Label>Progress</Label>
              <div className="mt-2 space-y-2">
                <Progress value={task.progress} className="w-full" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{task.progress}% Complete</span>
                  {isEditing && (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingTask?.progress || 0}
                      onChange={(e) => handleFieldChange('progress', parseInt(e.target.value))}
                      className="w-20 h-6 text-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assigned-to">Assigned To</Label>
              {isEditing ? (
                <Input
                  id="assigned-to"
                  value={editingTask?.assigned_to || editingTask?.assignedTo || ''}
                  onChange={(e) => handleFieldChange('assigned_to', e.target.value)}
                  className="mt-1"
                  placeholder="Enter assignee name"
                />
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{task.assigned_to || task.assignedTo || 'Unassigned'}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="due-date">Due Date</Label>
              {isEditing ? (
                <Input
                  id="due-date"
                  type="date"
                  value={editingTask?.due_date ? format(new Date(editingTask.due_date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleFieldChange('due_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {task.due_date || task.dueDate ? format(new Date(task.due_date || task.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-700">{format(new Date(task.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Last Updated</span>
              <span className="text-gray-700">{format(new Date(task.updated_at), 'MMM d, yyyy')}</span>
            </div>
            {task.wbs_item_id && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">WBS Link</span>
                <Badge variant="outline" className="text-xs">Connected</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};