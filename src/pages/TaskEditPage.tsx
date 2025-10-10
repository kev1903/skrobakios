import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/components/tasks/TaskContext';
import { useTaskContext } from '@/components/tasks/useTaskContext';
import { TaskEditHeader } from '@/components/tasks/TaskEditHeader';
import { EnhancedTaskEditForm } from '@/components/tasks/enhanced/EnhancedTaskEditForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { SubtasksList } from '@/components/tasks/subtasks';
import { TaskCommentsActivity } from '@/components/tasks/TaskCommentsActivity';
import { SubmittalWorkflow } from '@/components/tasks/SubmittalWorkflow';
import { TaskAttachmentsDisplay } from '@/components/tasks/TaskAttachmentsDisplay';
import { useToast } from '@/hooks/use-toast';

interface TaskEditPageProps {
  onNavigate: (page: string) => void;
}

export const TaskEditPage = ({ onNavigate }: TaskEditPageProps) => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attachments: false,
    subtasks: true,
    workflow: false,
    activity: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setEditedTask({ ...task });
        setHasUnsavedChanges(false);
      }
    }
  }, [taskId, tasks]);

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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Badge className={getPriorityBadgeColor(editedTask.priority)}>
                  {editedTask.priority}
                </Badge>
                <Badge className={getStatusBadgeColor(editedTask.status)}>
                  {editedTask.status}
                </Badge>
              </div>
            </div>
            <TaskEditHeader
              task={editedTask}
              onTaskNameChange={handleTaskNameChange}
              onMarkComplete={handleMarkComplete}
              onDelete={handleDelete}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Task Edit Form */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
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
              className="bg-card rounded-lg border shadow-sm"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 transition-colors">
                <h3 className="text-lg font-semibold">Subtasks</h3>
                {expandedSections.subtasks ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <SubtasksList taskId={editedTask.id} projectMembers={[]} />
              </CollapsibleContent>
            </Collapsible>

            {/* Attachments Section */}
            <Collapsible
              open={expandedSections.attachments}
              onOpenChange={() => toggleSection('attachments')}
              className="bg-card rounded-lg border shadow-sm"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 transition-colors">
                <h3 className="text-lg font-semibold">Attachments</h3>
                {expandedSections.attachments ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <TaskAttachmentsDisplay taskId={editedTask.id} />
              </CollapsibleContent>
            </Collapsible>

            {/* Workflow Section */}
            <Collapsible
              open={expandedSections.workflow}
              onOpenChange={() => toggleSection('workflow')}
              className="bg-card rounded-lg border shadow-sm"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 transition-colors">
                <h3 className="text-lg font-semibold">Workflow</h3>
                {expandedSections.workflow ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <SubmittalWorkflow taskId={editedTask.id} projectMembers={[]} />
              </CollapsibleContent>
            </Collapsible>

            {/* Activity Section */}
            <Collapsible
              open={expandedSections.activity}
              onOpenChange={() => toggleSection('activity')}
              className="bg-card rounded-lg border shadow-sm"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 transition-colors">
                <h3 className="text-lg font-semibold">Activity</h3>
                {expandedSections.activity ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <TaskCommentsActivity taskId={editedTask.id} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};
