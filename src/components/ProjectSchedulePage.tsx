import React, { useState, useMemo } from 'react';
import { ModernGanttChart, ModernGanttTask } from '@/components/timeline/ModernGanttChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Filter, Download, Settings } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface ProjectSchedulePageProps {
  onNavigate: (page: string) => void;
  projectId?: string;
}

export const ProjectSchedulePage = ({ onNavigate, projectId }: ProjectSchedulePageProps) => {
  // Sample tasks for demonstration
  const [tasks, setTasks] = useState<ModernGanttTask[]>([
    {
      id: '1',
      name: 'Project Planning',
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      progress: 80,
      status: 'in-progress',
      assignee: 'JD',
      duration: '5 days',
      category: 'Planning',
      isStage: true
    },
    {
      id: '2',
      name: 'Requirements Analysis',
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      progress: 100,
      status: 'completed',
      assignee: 'SM',
      duration: '3 days',
      category: 'Planning',
      parentId: '1'
    },
    {
      id: '3',
      name: 'Resource Planning',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 5),
      progress: 60,
      status: 'in-progress',
      assignee: 'AL',
      duration: '3 days',
      category: 'Planning',
      parentId: '1'
    },
    {
      id: '4',
      name: 'Design Phase',
      startDate: addDays(new Date(), 6),
      endDate: addDays(new Date(), 15),
      progress: 40,
      status: 'in-progress',
      assignee: 'JD',
      duration: '10 days',
      category: 'Design',
      isStage: true
    },
    {
      id: '5',
      name: 'UI/UX Design',
      startDate: addDays(new Date(), 6),
      endDate: addDays(new Date(), 12),
      progress: 70,
      status: 'in-progress',
      assignee: 'MK',
      duration: '7 days',
      category: 'Design',
      parentId: '4'
    },
    {
      id: '6',
      name: 'System Architecture',
      startDate: addDays(new Date(), 8),
      endDate: addDays(new Date(), 15),
      progress: 20,
      status: 'pending',
      assignee: 'RS',
      duration: '8 days',
      category: 'Design',
      parentId: '4'
    },
    {
      id: '7',
      name: 'Development',
      startDate: addDays(new Date(), 16),
      endDate: addDays(new Date(), 35),
      progress: 0,
      status: 'pending',
      assignee: 'TM',
      duration: '20 days',
      category: 'Development',
      isStage: true
    }
  ]);

  const [selectedView, setSelectedView] = useState<'gantt' | 'calendar'>('gantt');

  const handleTaskUpdate = (taskId: string, updates: Partial<ModernGanttTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleTaskAdd = (newTask: Omit<ModernGanttTask, 'id'>) => {
    const id = `task-${Date.now()}`;
    setTasks(prev => [...prev, { ...newTask, id }]);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const projectStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const avgProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      avgProgress: Math.round(avgProgress)
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('projects')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Project Schedule
              </h1>
              <p className="text-sm text-gray-600">
                Plan, track, and manage project timelines
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('gantt')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'gantt'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Gantt View
              </button>
              <button
                onClick={() => setSelectedView('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar View
              </button>
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              Total Tasks: {projectStats.totalTasks}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              Completed: {projectStats.completedTasks}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              In Progress: {projectStats.inProgressTasks}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              Overall Progress: {projectStats.avgProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {selectedView === 'gantt' ? (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <ModernGanttChart
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Calendar view coming soon!</p>
                <p className="text-sm mt-2">Switch to Gantt view to see the timeline.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};