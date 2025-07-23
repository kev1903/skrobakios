import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Flag, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { taskService } from '@/components/tasks/taskService';
import { useToast } from '@/hooks/use-toast';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a task name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await taskService.addTask({
        project_id: '', // You might want to select a project
        taskName: formData.taskName,
        taskType: 'Task',
        priority: formData.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: formData.assignedTo || 'Unassigned',
          avatar: ''
        },
        dueDate: formData.dueDate,
        status: formData.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: 0,
        description: formData.description,
        duration: 0,
        is_milestone: false,
        is_critical_path: false
      });

      toast({
        title: "Task created successfully",
        description: "Your new task has been added to the backlog.",
      });
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "There was an error creating your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
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
              <FileText className="w-6 h-6 text-blue-500" />
              Create New Task
            </CardTitle>
            <p className="text-gray-600">Add a new task to your backlog and keep track of your work.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Name */}
              <div className="space-y-2">
                <Label htmlFor="taskName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Task Name
                </Label>
                <Input
                  id="taskName"
                  placeholder="Enter task name..."
                  value={formData.taskName}
                  onChange={(e) => handleInputChange('taskName', e.target.value)}
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* Priority and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date and Assigned To Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assigned To
                  </Label>
                  <Input
                    id="assignedTo"
                    placeholder="Enter assignee name..."
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-2.5 rounded-xl border-gray-200/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTaskPage;