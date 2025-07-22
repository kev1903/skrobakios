import React, { useState, useMemo } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ModernGanttChart, ModernGanttTask } from '@/components/timeline/ModernGanttChart';
import { useScreenSize } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, X, Calendar, Plus, Filter, Download, BarChart3, List } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { addDays, format } from 'date-fns';

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  const screenSize = useScreenSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'gantt' | 'calendar'>('gantt');

  // Sample tasks based on the image - WBS style with construction tasks
  const [tasks, setTasks] = useState<ModernGanttTask[]>([
    {
      id: '1',
      name: 'Roof Drainage Design',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 16),
      progress: 60,
      status: 'in-progress',
      assignee: 'RD',
      duration: '14 days',
      category: 'Design',
      isStage: true
    },
    {
      id: '2',
      name: 'Design Development',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 8),
      progress: 80,
      status: 'in-progress',
      assignee: 'SM',
      duration: '6 days',
      category: 'Design',
      parentId: '1'
    },
    {
      id: '3',
      name: 'Technical Documentation',
      startDate: addDays(new Date(), 9),
      endDate: addDays(new Date(), 16),
      progress: 40,
      status: 'pending',
      assignee: 'TD',
      duration: '7 days',
      category: 'Design',
      parentId: '1'
    },
    {
      id: '4',
      name: 'Solar Panels',
      startDate: addDays(new Date(), 17),
      endDate: addDays(new Date(), 24),
      progress: 0,
      status: 'pending',
      assignee: 'SP',
      duration: '7 days',
      category: 'Installation',
      isStage: true
    },
    {
      id: '5',
      name: 'Panel Procurement',
      startDate: addDays(new Date(), 17),
      endDate: addDays(new Date(), 20),
      progress: 0,
      status: 'pending',
      assignee: 'PP',
      duration: '3 days',
      category: 'Procurement',
      parentId: '4'
    },
    {
      id: '6',
      name: 'Installation Setup',
      startDate: addDays(new Date(), 21),
      endDate: addDays(new Date(), 24),
      progress: 0,
      status: 'pending',
      assignee: 'IS',
      duration: '3 days',
      category: 'Installation',
      parentId: '4'
    },
    {
      id: '7',
      name: 'Timber Floor Installation',
      startDate: addDays(new Date(), 25),
      endDate: addDays(new Date(), 35),
      progress: 0,
      status: 'pending',
      assignee: 'TF',
      duration: '10 days',
      category: 'Flooring',
      isStage: true
    },
    {
      id: '8',
      name: 'Window Furnishing',
      startDate: addDays(new Date(), 30),
      endDate: addDays(new Date(), 40),
      progress: 0,
      status: 'pending',
      assignee: 'WF',
      duration: '10 days',
      category: 'Furnishing',
      isStage: true
    },
    {
      id: '9',
      name: 'Pool Fence/Gate',
      startDate: addDays(new Date(), 36),
      endDate: addDays(new Date(), 42),
      progress: 0,
      status: 'pending',
      assignee: 'PF',
      duration: '6 days',
      category: 'Safety',
      isStage: true
    },
    {
      id: '10',
      name: 'Perform Final Inspection',
      startDate: addDays(new Date(), 43),
      endDate: addDays(new Date(), 45),
      progress: 0,
      status: 'pending',
      assignee: 'FI',
      duration: '2 days',
      category: 'Quality',
      isStage: true
    },
    {
      id: '11',
      name: 'Architect/Engineer Review',
      startDate: addDays(new Date(), 46),
      endDate: addDays(new Date(), 48),
      progress: 0,
      status: 'pending',
      assignee: 'AE',
      duration: '2 days',
      category: 'Review',
      isStage: true
    },
    {
      id: '12',
      name: '12 Site Hoarding',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 5),
      progress: 100,
      status: 'completed',
      assignee: 'SH',
      duration: '4 days',
      category: 'Setup',
      isStage: true
    },
    {
      id: '13',
      name: 'Retaining Wall',
      startDate: addDays(new Date(), 6),
      endDate: addDays(new Date(), 15),
      progress: 70,
      status: 'in-progress',
      assignee: 'RW',
      duration: '9 days',
      category: 'Structure',
      isStage: true
    },
    {
      id: '14',
      name: 'Trusses & Framing',
      startDate: addDays(new Date(), 16),
      endDate: addDays(new Date(), 28),
      progress: 0,
      status: 'pending',
      assignee: 'TF',
      duration: '12 days',
      category: 'Structure',
      isStage: true
    },
    {
      id: '15',
      name: 'Insulation & Plaster',
      startDate: addDays(new Date(), 29),
      endDate: addDays(new Date(), 38),
      progress: 0,
      status: 'pending',
      assignee: 'IP',
      duration: '9 days',
      category: 'Interior',
      isStage: true
    }
  ]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  // Render the header controls
  const renderHeaderControls = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {project.name} - Timeline
          </h2>
          <p className="text-sm text-gray-600">
            Track project progress and schedule
          </p>
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
              <BarChart3 className="w-4 h-4 mr-1" />
              Gantt
            </button>
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
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

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-600">
            Total: {projectStats.totalTasks}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium text-gray-600">
            Completed: {projectStats.completedTasks}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="font-medium text-gray-600">
            In Progress: {projectStats.inProgressTasks}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="font-medium text-gray-600">
            Overall Progress: {projectStats.avgProgress}%
          </span>
        </div>
      </div>
    </div>
  );

  // Render the main content
  const renderMainContent = () => (
    <div className="flex-1 bg-white">
      {renderHeaderControls()}
      
      <div className="p-4 overflow-x-hidden w-full">
        {selectedView === 'gantt' ? (
          <div className="w-full overflow-hidden">{/* Prevent any overflow */}
            <Card className="shadow-lg w-full">
              <CardContent className="p-0 overflow-hidden">
                <ModernGanttChart
                  tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                />
              </CardContent>
            </Card>
          </div>
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

  // Mobile layout with drawer
  if (screenSize === 'mobile') {
    return (
      <div className="h-screen flex flex-col backdrop-blur-xl bg-black/20 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="flex-shrink-0 h-16 px-4 flex items-center justify-between backdrop-blur-xl bg-white/10 border-b border-white/10">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white/10 backdrop-blur-md border-white/20">
              <ProjectSidebar 
                project={project} 
                onNavigate={(page) => {
                  onNavigate(page);
                  setSidebarOpen(false);
                }} 
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                activeSection="timeline"
              />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-white truncate">{project.name}</h1>
            <p className="text-sm text-white/70">Timeline</p>
          </div>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-auto backdrop-blur-xl bg-white/95">
          {renderMainContent()}
        </div>
      </div>
    );
  }

  // Tablet layout with collapsible sidebar
  if (screenSize === 'tablet') {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        {/* Tablet Sidebar - Collapsible */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0`}>
          <div className="relative h-full">
            <ProjectSidebar 
              project={project} 
              onNavigate={onNavigate} 
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              activeSection="timeline"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-3 top-4 z-10 bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tablet Content */}
        <div className="flex-1 overflow-auto backdrop-blur-xl bg-white/95 border-l border-white/10">
          {renderMainContent()}
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Desktop Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="timeline"
      />

      {/* Desktop Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10 animate-fade-in">
        {renderMainContent()}
      </div>
    </div>
  );
};
