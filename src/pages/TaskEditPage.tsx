import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Task } from '@/components/tasks/TaskContext';
import { useTaskContext } from '@/components/tasks/useTaskContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { getStatusColor, getStatusText } from '@/components/tasks/utils/taskUtils';
import { TaskEditContent } from '@/components/tasks/TaskEditContent';

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
            startDate: data.start_date || undefined,
            endDate: data.end_date || undefined,
            dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString() : '',
            status: (data.status || 'Not Started') as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
            progress: data.progress || 0,
            description: data.description || '',
            duration: data.duration || 0,
            is_milestone: data.is_milestone || false,
            is_critical_path: data.is_critical_path || false,
            subtasks: Array.isArray(data.subtasks) ? data.subtasks as Array<{ id: string; name: string; completed: boolean }> : [],
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
        console.log('Saving task with description:', editedTask.description);
        await updateTask(editedTask.id, editedTask);
        setHasUnsavedChanges(false);
        toast({
          title: "Changes saved",
          description: "Your task has been updated successfully.",
        });
      } catch (error) {
        console.error('Error saving task:', error);
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
      console.log('Task update received:', updates);
      const updatedTask = {
        ...editedTask,
        ...updates
      };
      console.log('Updated task description:', updatedTask.description);
      setEditedTask(updatedTask);
      setHasUnsavedChanges(true);
    }
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

      {/* Main Content - Fixed positioning to match Project Tasks */}
      <div className="fixed left-40 right-0 top-[var(--header-height)] bottom-0 overflow-hidden">
        <TaskEditContent 
          task={editedTask}
          hasUnsavedChanges={hasUnsavedChanges}
          onBack={handleBack}
          onSave={handleSave}
          onDelete={handleDelete}
          onMarkComplete={handleMarkComplete}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </div>
  );
};
