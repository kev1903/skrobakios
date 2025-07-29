import React, { createContext, useState, ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import { taskService } from './taskService';
import { Task, TaskContextType } from './types';

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Re-export types for convenience
export type { Task, TaskContextType };

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useUser();

  const loadTasksForProject = async (projectId: string) => {
    // Prevent multiple concurrent requests
    if (loading) return;
    
    setLoading(true);
    try {
      const tasksData = await taskService.loadTasksForProject(projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, updates, userProfile);

      // Update local state immediately for better UX
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await taskService.addTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, loadTasksForProject, updateTask, addTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
