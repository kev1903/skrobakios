import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/components/tasks/taskService';
import { Task } from '@/components/tasks/types';
import { MyTasksCalendarView } from '@/components/my-tasks/MyTasksCalendarView';
import { TaskEditSidePanel } from '@/components/tasks/TaskEditSidePanel';
import { useUser } from '@/contexts/UserContext';
import { useToast } from "@/hooks/use-toast";
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';
import desertDunesBg from '@/assets/desert-dunes-bg.jpg';
import { cn } from '@/lib/utils';

const TasksPage = () => {
  const { userProfile } = useUser();
  const { toast } = useToast();
  const { spacingClasses, fullHeightClasses } = useMenuBarSpacing();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);

  // Load tasks assigned to the current user with real-time sync
  useEffect(() => {
    const loadUserTasks = async () => {
      try {
        setLoading(true);
        console.log('🔄 TasksPage: Loading user tasks...');
        const tasks = await taskService.loadTasksAssignedToUser();
        console.log('📋 TasksPage: Loaded tasks:', tasks.length);
        setUserTasks(tasks);
      } catch (error) {
        console.error('❌ TasksPage: Error loading user tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadUserTasks();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('tasks-page-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('🔄 TasksPage: Task change detected:', payload);
          // Refetch tasks when any task changes
          loadUserTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Handle task update with proper error handling
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('🔄 TasksPage: Updating task:', taskId, updates);
      await taskService.updateTask(taskId, updates, userProfile);
      
      // Reload tasks to reflect changes
      const updatedTasks = await taskService.loadTasksAssignedToUser();
      setUserTasks(updatedTasks);
      
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ TasksPage: Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };

  // Handle task click to open edit panel
  const handleTaskClick = (task: Task) => {
    console.log('👆 TasksPage: Task clicked:', task.taskName);
    setSelectedTaskForEdit(task);
    setIsTaskEditOpen(true);
  };

  if (loading) {
    return (
      <div 
        className="h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${desertDunesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 backdrop-blur-[2px]" />
        <div className="relative z-10 glass-card p-8">
          <div className="text-center">
            <div className="text-lg text-white/90 font-medium mb-2">Loading Tasks...</div>
            <div className="text-sm text-white/60">Please wait while we fetch your tasks</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Glass Morphism Background Container */}
      <div 
        className="h-screen relative overflow-hidden"
        style={{
          backgroundImage: `url(${desertDunesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 backdrop-blur-[2px]" />
        
        {/* Main Content Container */}
        <div className={cn("relative z-10 h-full", spacingClasses, fullHeightClasses)}>
          {/* Return to Home Button - Fixed Position */}
          <div className="absolute top-6 left-6 z-20">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group font-inter">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Return to Home</span>
            </Link>
          </div>

          {/* NEW REDESIGNED CALENDAR VIEW */}
          <div className="h-full">
            <MyTasksCalendarView
              tasks={userTasks}
              onTaskClick={handleTaskClick}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>

          {/* Task Edit Panel */}
          <TaskEditSidePanel
            task={selectedTaskForEdit}
            isOpen={isTaskEditOpen}
            onClose={() => {
              setIsTaskEditOpen(false);
              setSelectedTaskForEdit(null);
            }}
            updateTask={handleTaskUpdate}
            deleteTask={async (taskId: string) => {
              try {
                await taskService.deleteTask(taskId);
                // Reload tasks to reflect changes
                const updatedTasks = await taskService.loadTasksAssignedToUser();
                setUserTasks(updatedTasks);
                
                toast({
                  title: "Task deleted",
                  description: "Task has been successfully deleted.",
                  duration: 3000,
                });
              } catch (error) {
                console.error('❌ TasksPage: Error deleting task:', error);
                toast({
                  title: "Error",
                  description: "Failed to delete task. Please try again.",
                  variant: "destructive",
                  duration: 3000,
                });
                throw error;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;