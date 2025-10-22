import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/components/tasks/TaskContext';
import { useTaskContext } from '@/components/tasks/useTaskContext';
import { ArrowLeft, Trash2, Save, FileText, Upload, MessageSquare, CheckSquare, DollarSign, Sparkles, Edit2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { getStatusColor, getStatusText } from '@/components/tasks/utils/taskUtils';
import { TaskDetailsTab } from '@/components/tasks/tabs/TaskDetailsTab';
import { TaskSubmittalsTab } from '@/components/tasks/tabs/TaskSubmittalsTab';
import { TaskReviewsTab } from '@/components/tasks/tabs/TaskReviewsTab';
import { TaskQATab } from '@/components/tasks/tabs/TaskQATab';
import { TaskCostsTab } from '@/components/tasks/tabs/TaskCostsTab';
import { TaskAISummaryTab } from '@/components/tasks/tabs/TaskAISummaryTab';
import { UserPermissionsContext } from '@/contexts/UserPermissionsContext';

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
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  
  // Optional permissions context - may not be available if no company is selected
  const permissionsContext = React.useContext(UserPermissionsContext);
  const canViewSubModule = permissionsContext?.canViewSubModule ?? (() => true);

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

      {/* Main Content - Fixed positioning with better top spacing */}
      <div className="fixed left-40 right-0 top-20 bottom-0 overflow-hidden">
        <div className="h-full w-full flex flex-col bg-[hsl(var(--background))]">
          {/* Luxury Header Bar with Glass Effect */}
          <div className="sticky top-0 z-30 border-b border-border/50 bg-gradient-to-b from-white to-accent/20 backdrop-blur-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBack} 
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                  </Button>
                  <div className="h-4 w-px bg-border/50" />
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
                    className={editedTask.status === 'Completed' 
                      ? 'bg-luxury-gold text-white hover:bg-luxury-gold/90' 
                      : 'border-border/50 hover:bg-luxury-gold/10 hover:border-luxury-gold/50'}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {editedTask.status === 'Completed' ? 'Completed' : 'Mark Complete'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDelete} 
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {hasUnsavedChanges && (
                    <div className="h-4 w-px bg-border/50" />
                  )}
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className="bg-luxury-gold text-white hover:bg-luxury-gold-dark shadow-[0_2px_8px_rgba(0,0,0,0.1)] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content with Tabs */}
          <div className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
            <div className="max-w-7xl mx-auto w-full px-8 py-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-white/80 border border-border/30 rounded-xl h-auto p-1 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-1 w-full">
                    <TabsTrigger 
                      value="details" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Details</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="submittals" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Submittals</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                      disabled={!canViewSubModule('tasks', 'reviews')}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Reviews</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="qa" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Q&A</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="costs" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Costs</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="summary" 
                      className="flex items-center gap-2 rounded-lg border-0 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] px-4 py-2.5 text-muted-foreground data-[state=active]:font-medium transition-all duration-200"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Summary</span>
                    </TabsTrigger>
                  </div>
                </TabsList>

                <TabsContent value="details" className="mt-0">
                  <TaskDetailsTab 
                    task={editedTask} 
                    onUpdate={handleTaskUpdate}
                  />
                </TabsContent>

                <TabsContent value="submittals" className="mt-0">
                  <TaskSubmittalsTab taskId={editedTask.id} />
                </TabsContent>

                <TabsContent value="reviews" className="mt-0">
                  <TaskReviewsTab taskId={editedTask.id} />
                </TabsContent>

                <TabsContent value="qa" className="mt-0">
                  <TaskQATab taskId={editedTask.id} />
                </TabsContent>

                <TabsContent value="costs" className="mt-0">
                  <TaskCostsTab taskId={editedTask.id} />
                </TabsContent>

                <TabsContent value="summary" className="mt-0">
                  <TaskAISummaryTab taskId={editedTask.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
