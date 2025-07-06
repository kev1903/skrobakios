import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  project_id: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: { name: string; avatar: string };
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Not Started';
  progress: number;
  description?: string;
  duration?: number;
  digital_object_id?: string;
  created_at: string;
  updated_at: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  loadTasksForProject: (projectId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // No fallback tasks - fetch only from database

  const loadTasksForProject = async (projectId: string) => {
    // Prevent multiple concurrent requests
    if (loading) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to component interface
      const mappedTasks = (data || []).map(task => ({
        id: task.id,
        project_id: task.project_id,
        taskName: task.task_name,
        priority: task.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: task.assigned_to_name || '',
          avatar: task.assigned_to_avatar || ''
        },
        dueDate: task.due_date || '',
        status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: task.progress,
        description: task.description,
        duration: task.duration,
        digital_object_id: task.digital_object_id,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Map component fields to database fields
      const dbUpdates: any = {};
      if (updates.taskName !== undefined) dbUpdates.task_name = updates.taskName;
      if (updates.assignedTo !== undefined) {
        dbUpdates.assigned_to_name = updates.assignedTo.name;
        dbUpdates.assigned_to_avatar = updates.assignedTo.avatar;
      }
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.digital_object_id !== undefined) dbUpdates.digital_object_id = updates.digital_object_id;

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) throw error;

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
      // Map component fields to database fields
      const dbTask = {
        project_id: taskData.project_id,
        task_name: taskData.taskName,
        priority: taskData.priority,
        assigned_to_name: taskData.assignedTo?.name || null,
        assigned_to_avatar: taskData.assignedTo?.avatar || null,
        due_date: taskData.dueDate || null,
        status: taskData.status,
        progress: taskData.progress,
        description: taskData.description || null,
        duration: taskData.duration || null,
        digital_object_id: taskData.digital_object_id || null
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([dbTask])
        .select()
        .single();

      if (error) throw error;

      // Map response back to component interface
      const newTask: Task = {
        id: data.id,
        project_id: data.project_id,
        taskName: data.task_name,
        priority: data.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: data.assigned_to_name || '',
          avatar: data.assigned_to_avatar || ''
        },
        dueDate: data.due_date || '',
        status: data.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: data.progress,
        description: data.description,
        duration: data.duration,
        digital_object_id: data.digital_object_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

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
