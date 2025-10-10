import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Task } from '@/components/tasks/TaskContext';
import { useTaskContext } from '@/components/tasks/useTaskContext';
import { EnhancedTaskEditForm } from '@/components/tasks/enhanced/EnhancedTaskEditForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ArrowLeft, Edit2, Check, Paperclip, Timer, MessageSquare, Link, Trash2, Save } from 'lucide-react';
import { SubtasksList } from '@/components/tasks/subtasks';
import { TaskCommentsActivity } from '@/components/tasks/TaskCommentsActivity';
import { SubmittalWorkflow } from '@/components/tasks/SubmittalWorkflow';
import { TaskAttachmentsDisplay } from '@/components/tasks/TaskAttachmentsDisplay';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Editable Task Title Component
const EditableTaskTitle = ({ taskName, onTaskNameChange }: { taskName: string; onTaskNameChange?: (name: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(taskName);

  useEffect(() => {
    setEditValue(taskName);
  }, [taskName]);

  const handleSave = () => {
    if (editValue.trim() && onTaskNameChange) {
      onTaskNameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(taskName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="text-2xl font-bold border-0 focus-visible:ring-0 px-0 h-auto bg-transparent"
        autoFocus
      />
    );
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-accent/30 p-2 -ml-2 rounded-md transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <h1 className="text-2xl font-bold text-foreground">{taskName}</h1>
      <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

interface TaskEditPageProps {
  onNavigate: (page: string) => void;
}

export const TaskEditPage = ({ onNavigate }: TaskEditPageProps) => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    attachments: false,
    subtasks: true,
    workflow: false,
    activity: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First try to find in context
        const contextTask = tasks.find(t => t.id === taskId);
        if (contextTask) {
          setEditedTask({ ...contextTask });
          setHasUnsavedChanges(false);
          setLoading(false);
          return;
        }

        // If not in context, fetch from database
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (error) throw error;

        if (data) {
          // Map the database task to Task type
          const mappedTask: Task = {
            id: data.id,
            project_id: data.project_id,
            taskName: data.task_name || '',
            task_number: data.task_number || '',
            taskType: (data.task_type || 'Task') as 'Task' | 'Bug' | 'Feature',
            priority: (data.priority || 'Medium') as 'High' | 'Medium' | 'Low',
            assignedTo: {
              name: data.assigned_to_name || '',
              avatar: data.assigned_to_avatar || '',
              userId: data.assigned_to_user_id
            },
            dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString() : '',
            status: (data.status || 'Not Started') as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
            progress: data.progress || 0,
            description: data.description || '',
            duration: data.estimated_hours || 0,
            is_milestone: data.is_milestone || false,
            is_critical_path: data.is_critical_path || false,
            created_at: data.created_at,
            updated_at: data.updated_at
          };

          setEditedTask(mappedTask);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        toast({
          title: "Error loading task",
          description: "Could not load the task. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, tasks, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (!editedTask) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (editedTask && hasUnsavedChanges) {
      try {
        updateTask(editedTask.id, editedTask);
        setHasUnsavedChanges(false);
      } catch (error) {
        toast({
          title: "Error saving task",
          description: "There was an error saving your changes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    window.history.back();
  };

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        ...updates
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleTaskNameChange = (newName: string) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        taskName: newName
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  const handleMarkComplete = async () => {
    if (editedTask) {
      const updatedTask = {
        ...editedTask,
        status: 'Completed' as const,
        progress: 100
      };
      setEditedTask(updatedTask);
      setHasUnsavedChanges(true);
      await updateTask(editedTask.id, updatedTask);
      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      });
    }
  };

  const handleDelete = async () => {
    if (editedTask && window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(editedTask.id);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      handleBack();
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case 'Not Started':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Enhanced Header with Task Title */}
      <div className="flex-shrink-0 border-b backdrop-blur-xl bg-card/95 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row - Back, Badges, Actions */}
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="shrink-0 hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back</span>
              </Button>
              <div className="h-5 w-px bg-border" />
              <Badge variant="outline" className={`${getPriorityBadgeColor(editedTask.priority)} text-xs font-medium px-3`}>
                {editedTask.priority}
              </Badge>
              <Badge variant="outline" className={`${getStatusBadgeColor(editedTask.status)} text-xs font-medium px-3`}>
                {editedTask.status}
              </Badge>
              {editedTask.task_number && (
                <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                  {editedTask.task_number}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button 
                onClick={handleMarkComplete}
                variant={editedTask.status === 'Completed' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                disabled={editedTask.status === 'Completed'}
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Complete</span>
              </Button>
              {editedTask.task_number && (
                <Badge variant="outline" className="text-xs font-mono hidden md:flex">
                  #{editedTask.task_number}
                </Badge>
              )}
              <div className="h-5 w-px bg-border mx-1" />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Timer className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete} 
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                className="ml-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Bottom Row - Task Title */}
          <div className="py-4">
            <EditableTaskTitle 
              taskName={editedTask.taskName}
              onTaskNameChange={handleTaskNameChange}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Task Details - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Task Edit Form */}
              <div className="backdrop-blur-xl bg-card/90 rounded-xl border shadow-sm p-4">
                <EnhancedTaskEditForm
                  task={editedTask}
                  projectId={editedTask.project_id}
                  onTaskUpdate={handleTaskUpdate}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>

              {/* Subtasks Section */}
              <Collapsible
                open={expandedSections.subtasks}
                onOpenChange={() => toggleSection('subtasks')}
                className="backdrop-blur-xl bg-card/90 rounded-xl border shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors border-b">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${expandedSections.subtasks ? 'bg-primary' : 'bg-muted'}`} />
                    <h3 className="text-sm font-semibold">Subtasks</h3>
                  </div>
                  {expandedSections.subtasks ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4">
                  <SubtasksList taskId={editedTask.id} projectMembers={[]} />
                </CollapsibleContent>
              </Collapsible>

              {/* Activity Section */}
              <Collapsible
                open={expandedSections.activity}
                onOpenChange={() => toggleSection('activity')}
                className="backdrop-blur-xl bg-card/90 rounded-xl border shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors border-b">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${expandedSections.activity ? 'bg-primary' : 'bg-muted'}`} />
                    <h3 className="text-sm font-semibold">Activity & Comments</h3>
                  </div>
                  {expandedSections.activity ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4">
                  <TaskCommentsActivity taskId={editedTask.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-4">
              {/* Attachments Section */}
              <Collapsible
                open={expandedSections.attachments}
                onOpenChange={() => toggleSection('attachments')}
                className="backdrop-blur-xl bg-card/90 rounded-xl border shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors border-b">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${expandedSections.attachments ? 'bg-primary' : 'bg-muted'}`} />
                    <h3 className="text-sm font-semibold">Attachments</h3>
                  </div>
                  {expandedSections.attachments ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4">
                  <TaskAttachmentsDisplay taskId={editedTask.id} />
                </CollapsibleContent>
              </Collapsible>

              {/* Workflow Section */}
              <Collapsible
                open={expandedSections.workflow}
                onOpenChange={() => toggleSection('workflow')}
                className="backdrop-blur-xl bg-card/90 rounded-xl border shadow-sm overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors border-b">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${expandedSections.workflow ? 'bg-primary' : 'bg-muted'}`} />
                    <h3 className="text-sm font-semibold">Workflow</h3>
                  </div>
                  {expandedSections.workflow ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4">
                  <SubmittalWorkflow taskId={editedTask.id} projectMembers={[]} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
