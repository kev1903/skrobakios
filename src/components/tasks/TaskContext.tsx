
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: { name: string; avatar: string };
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Not Started';
  progress: number;
  description?: string;
  category?: string;
}

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "#PT001",
      taskName: "Site Preparation",
      priority: "High",
      assignedTo: { name: "John Smith", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-15",
      status: "In Progress",
      progress: 75,
      description: "Prepare the construction site for foundation work",
      category: "Construction"
    },
    {
      id: "#PT002",
      taskName: "Foundation Work",
      priority: "High",
      assignedTo: { name: "Sarah Wilson", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-20",
      status: "Pending",
      progress: 0,
      description: "Complete foundation and basement work",
      category: "Construction"
    },
    {
      id: "#PT003",
      taskName: "Architectural Review",
      priority: "Medium",
      assignedTo: { name: "Mike Johnson", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-10",
      status: "Completed",
      progress: 100,
      description: "Review and approve architectural plans",
      category: "Planning"
    },
    {
      id: "#PT004",
      taskName: "Electrical Planning",
      priority: "Medium",
      assignedTo: { name: "Lisa Brown", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-18",
      status: "In Progress",
      progress: 40,
      description: "Plan electrical systems and wiring",
      category: "Planning"
    },
    {
      id: "#PT005",
      taskName: "Plumbing Installation",
      priority: "Low",
      assignedTo: { name: "David Miller", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-25",
      status: "Not Started",
      progress: 0,
      description: "Install plumbing systems",
      category: "Installation"
    }
  ]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <TaskContext.Provider value={{ tasks, setTasks, updateTask, addTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
