import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, User, Tag, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';
import { taskService } from '@/components/tasks/taskService';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/components/tasks/types';
import { supabase } from '@/integrations/supabase/client';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { spacingClasses, minHeightClasses } = useMenuBarSpacing();
  const { userProfile } = useUser();
  const { currentCompany } = useCompany();
  const { toast } = useToast();

  const [taskData, setTaskData] = useState({
    taskName: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: '',
    assignedTo: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Auto-assign to current user
    if (userProfile.firstName && userProfile.lastName) {
      setTaskData(prev => ({
        ...prev,
        assignedTo: 'me'
      }));
    }
  }, [userProfile]);

  const handleCreateTask = async () => {
    if (!taskData.taskName.trim()) {
      toast({
        title: "Error",
        description: "Task name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Get current user ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        project_id: '', // This will be a personal task (no project)
        taskName: taskData.taskName.trim(),
        taskType: 'Task',
        priority: taskData.priority,
        assignedTo: {
          name: taskData.assignedTo === 'me' 
            ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
            : '',
          avatar: userProfile.avatarUrl || '',
          userId: taskData.assignedTo === 'me' ? user?.id : undefined
        },
        dueDate: taskData.dueDate 
          ? new Date(taskData.dueDate).toISOString() 
          : new Date().toISOString().split('T')[0] + 'T00:00:00.000Z', // Goes to backlog (midnight) if no due date
        status: 'Not Started',
        progress: 0,
        description: taskData.description.trim() || undefined,
        duration: null,
        is_milestone: false,
        is_critical_path: false
      };

      const createdTask = await taskService.addTask(newTask);
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      // Navigate back to tasks page
      navigate('/');
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={cn("bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6", minHeightClasses, spacingClasses)}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/tasks" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Tasks</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Plus className="w-6 h-6 text-blue-500" />
              Create New Task
            </CardTitle>
            <p className="text-gray-600">Add a new task to your backlog and keep track of your work.</p>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Task Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Task Name
                </label>
                <Input
                  placeholder="Enter task name..."
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  value={taskData.taskName}
                  onChange={(e) => setTaskData(prev => ({ ...prev, taskName: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the task details..."
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl min-h-[100px] resize-none"
                  value={taskData.description}
                  onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Compact 3-section row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <Select 
                    value={taskData.priority} 
                    onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                      setTaskData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <Select 
                    value={taskData.assignedTo} 
                    onValueChange={(value) => setTaskData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Assign to me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-xl border-gray-200/50"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTask}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25"
                  disabled={isCreating || !taskData.taskName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTaskPage;