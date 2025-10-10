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
import { WorkflowStatusPipeline, WorkflowStage } from '@/components/tasks/WorkflowStatusPipeline';
import { RoleAssignmentCard } from '@/components/tasks/RoleAssignmentCard';
import { SubmittalStatusCard } from '@/components/tasks/SubmittalStatusCard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { getStatusColor, getStatusText } from '@/components/tasks/utils/taskUtils';

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
  const [project, setProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    attachments: false,
    subtasks: true,
    workflow: false,
    activity: false
  });
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('pending');
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
          
          // Fetch project data
          if (contextTask.project_id) {
            const { data: projectData } = await supabase
              .from('projects')
              .select('*')
              .eq('id', contextTask.project_id)
              .single();
            if (projectData) setProject(projectData as unknown as Project);
          }
          
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
          
          // Fetch project data
          if (data.project_id) {
            const { data: projectData } = await supabase
              .from('projects')
              .select('*')
              .eq('id', data.project_id)
              .single();
            if (projectData) setProject(projectData as unknown as Project);
          }
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
    onNavigate('project-tasks');
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
    <div className="h-screen overflow-hidden">
      {/* Project Sidebar */}
      {project && (
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="tasks"
        />
      )}

      {/* Main Content - Fixed positioning to match Project Tasks */}
      <div className="fixed left-40 right-0 top-12 bottom-0 overflow-hidden">
        <div className="h-full w-full flex flex-col bg-background">
          {/* Two-bar Header Structure */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* First Bar - Project Name Only */}
            <div className="px-6 h-[72px] flex items-center border-b border-border">
              <h1 className="text-2xl font-bold text-foreground font-inter">{project?.name || 'Project'}</h1>
            </div>
            
            {/* Second Bar - Navigation and Actions */}
            <div className="px-6 h-14 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Button>
                <div className="h-6 w-px bg-border" />
                <h2 className="text-lg font-semibold text-foreground">
                  {editedTask.taskName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleMarkComplete}
                  variant={editedTask.status === 'Completed' ? 'default' : 'outline'}
                  size="sm"
                  disabled={editedTask.status === 'Completed'}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
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
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
              {/* Workflow Status Pipeline */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Task Workflow Status</h2>
                <WorkflowStatusPipeline
                  currentStage={workflowStage}
                  onStageChange={setWorkflowStage}
                  submittalCount={3}
                  approvedCount={1}
                />
              </div>

              {/* Role Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <RoleAssignmentCard
                  role="assignee"
                  name={editedTask.assignedTo?.name || 'Unassigned'}
                  avatar={editedTask.assignedTo?.avatar}
                  status={editedTask.status}
                />
                <RoleAssignmentCard
                  role="reviewer"
                  name="John Smith"
                  avatar=""
                  email="john.smith@example.com"
                  status="Active"
                />
              </div>

              {/* Submittals by Status */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Files & Submittals</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Review</h3>
                    <div className="space-y-2">
                      <SubmittalStatusCard
                        title="Structural Drawings"
                        status="Pending"
                        submittedBy="Mike Johnson"
                        submittedDate={new Date()}
                        fileCount={5}
                      />
                      <SubmittalStatusCard
                        title="Material Specifications"
                        status="Pending"
                        submittedBy="Sarah Davis"
                        submittedDate={new Date(Date.now() - 86400000)}
                        fileCount={3}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">In Review</h3>
                    <div className="space-y-2">
                      <SubmittalStatusCard
                        title="Electrical Plans"
                        status="In Review"
                        submittedBy="Tom Wilson"
                        submittedDate={new Date(Date.now() - 172800000)}
                        reviewedBy="John Smith"
                        fileCount={8}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Approved</h3>
                    <div className="space-y-2">
                      <SubmittalStatusCard
                        title="Site Plans"
                        status="Approved"
                        submittedBy="Mike Johnson"
                        submittedDate={new Date(Date.now() - 259200000)}
                        reviewedBy="John Smith"
                        fileCount={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Task Details - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
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
                  className="bg-card rounded-lg border shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold">Subtasks</h3>
                    </div>
                    {expandedSections.subtasks ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 py-4 border-t">
                    <SubtasksList taskId={editedTask.id} projectMembers={[]} />
                  </CollapsibleContent>
                </Collapsible>

                {/* Activity Section */}
                <Collapsible
                  open={expandedSections.activity}
                  onOpenChange={() => toggleSection('activity')}
                  className="bg-card rounded-lg border shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold">Activity & Comments</h3>
                    </div>
                    {expandedSections.activity ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 py-4 border-t">
                    <TaskCommentsActivity taskId={editedTask.id} />
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Sidebar - Right Column (1/3) */}
              <div className="space-y-6">
                {/* Attachments Section */}
                <Collapsible
                  open={expandedSections.attachments}
                  onOpenChange={() => toggleSection('attachments')}
                  className="bg-card rounded-lg border shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold">Attachments</h3>
                    </div>
                    {expandedSections.attachments ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 py-4 border-t">
                    <TaskAttachmentsDisplay taskId={editedTask.id} />
                  </CollapsibleContent>
                </Collapsible>

                {/* Workflow Section */}
                <Collapsible
                  open={expandedSections.workflow}
                  onOpenChange={() => toggleSection('workflow')}
                  className="bg-card rounded-lg border shadow-sm overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold">Workflow</h3>
                    </div>
                    {expandedSections.workflow ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 py-4 border-t">
                    <SubmittalWorkflow taskId={editedTask.id} projectMembers={[]} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
