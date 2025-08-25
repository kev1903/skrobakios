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
    // ============ STAGE 1: DESIGN & PLANNING ============
    {
      id: 'stage-1',
      name: 'DESIGN & PLANNING PHASE',
      startDate: addDays(new Date(), 0),
      endDate: addDays(new Date(), 30),
      progress: 65,
      status: 'in-progress',
      assignee: 'PM',
      duration: '30 days',
      category: 'Design',
      isStage: true
    },
    {
      id: 'parent-1.1',
      name: 'Roof Drainage Design',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 10),
      progress: 80,
      status: 'in-progress',
      assignee: 'RD',
      duration: '10 days',
      category: 'Design',
      parentId: 'stage-1'
    },
    {
      id: 'child-1.1.1',
      name: 'Design Development',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 5),
      progress: 100,
      status: 'completed',
      assignee: 'SM',
      duration: '5 days',
      category: 'Design',
      parentId: 'parent-1.1'
    },
    {
      id: 'child-1.1.2',
      name: 'Technical Documentation',
      startDate: addDays(new Date(), 6),
      endDate: addDays(new Date(), 10),
      progress: 60,
      status: 'in-progress',
      assignee: 'TD',
      duration: '5 days',
      category: 'Design',
      parentId: 'parent-1.1'
    },
    {
      id: 'parent-1.2',
      name: 'Site Preparation Planning',
      startDate: addDays(new Date(), 11),
      endDate: addDays(new Date(), 20),
      progress: 40,
      status: 'in-progress',
      assignee: 'SP',
      duration: '10 days',
      category: 'Planning',
      parentId: 'stage-1'
    },
    {
      id: 'child-1.2.1',
      name: 'Site Survey',
      startDate: addDays(new Date(), 11),
      endDate: addDays(new Date(), 15),
      progress: 70,
      status: 'in-progress',
      assignee: 'SS',
      duration: '5 days',
      category: 'Survey',
      parentId: 'parent-1.2'
    },
    {
      id: 'child-1.2.2',
      name: 'Permits & Approvals',
      startDate: addDays(new Date(), 16),
      endDate: addDays(new Date(), 20),
      progress: 10,
      status: 'pending',
      assignee: 'PA',
      duration: '5 days',
      category: 'Legal',
      parentId: 'parent-1.2'
    },

    // ============ STAGE 2: CONSTRUCTION ============
    {
      id: 'stage-2',
      name: 'CONSTRUCTION PHASE',
      startDate: addDays(new Date(), 31),
      endDate: addDays(new Date(), 80),
      progress: 25,
      status: 'pending',
      assignee: 'CM',
      duration: '50 days',
      category: 'Construction',
      isStage: true
    },
    {
      id: 'parent-2.1',
      name: 'Solar Panels Installation',
      startDate: addDays(new Date(), 31),
      endDate: addDays(new Date(), 45),
      progress: 30,
      status: 'pending',
      assignee: 'SI',
      duration: '15 days',
      category: 'Installation',
      parentId: 'stage-2'
    },
    {
      id: 'child-2.1.1',
      name: 'Panel Procurement',
      startDate: addDays(new Date(), 31),
      endDate: addDays(new Date(), 35),
      progress: 50,
      status: 'in-progress',
      assignee: 'PP',
      duration: '5 days',
      category: 'Procurement',
      parentId: 'parent-2.1'
    },
    {
      id: 'child-2.1.2',
      name: 'Mounting System Setup',
      startDate: addDays(new Date(), 36),
      endDate: addDays(new Date(), 40),
      progress: 0,
      status: 'pending',
      assignee: 'MS',
      duration: '5 days',
      category: 'Installation',
      parentId: 'parent-2.1'
    },
    {
      id: 'child-2.1.3',
      name: 'Electrical Connection',
      startDate: addDays(new Date(), 41),
      endDate: addDays(new Date(), 45),
      progress: 0,
      status: 'pending',
      assignee: 'EC',
      duration: '5 days',
      category: 'Electrical',
      parentId: 'parent-2.1'
    },
    {
      id: 'parent-2.2',
      name: 'Timber Floor Installation',
      startDate: addDays(new Date(), 46),
      endDate: addDays(new Date(), 60),
      progress: 0,
      status: 'pending',
      assignee: 'TF',
      duration: '15 days',
      category: 'Flooring',
      parentId: 'stage-2'
    },
    {
      id: 'child-2.2.1',
      name: 'Subfloor Preparation',
      startDate: addDays(new Date(), 46),
      endDate: addDays(new Date(), 50),
      progress: 0,
      status: 'pending',
      assignee: 'SF',
      duration: '5 days',
      category: 'Preparation',
      parentId: 'parent-2.2'
    },
    {
      id: 'child-2.2.2',
      name: 'Timber Installation',
      startDate: addDays(new Date(), 51),
      endDate: addDays(new Date(), 55),
      progress: 0,
      status: 'pending',
      assignee: 'TI',
      duration: '5 days',
      category: 'Installation',
      parentId: 'parent-2.2'
    },
    {
      id: 'child-2.2.3',
      name: 'Finishing & Sanding',
      startDate: addDays(new Date(), 56),
      endDate: addDays(new Date(), 60),
      progress: 0,
      status: 'pending',
      assignee: 'FS',
      duration: '5 days',
      category: 'Finishing',
      parentId: 'parent-2.2'
    },
    {
      id: 'parent-2.3',
      name: 'Window Furnishing',
      startDate: addDays(new Date(), 61),
      endDate: addDays(new Date(), 70),
      progress: 0,
      status: 'pending',
      assignee: 'WF',
      duration: '10 days',
      category: 'Furnishing',
      parentId: 'stage-2'
    },
    {
      id: 'child-2.3.1',
      name: 'Window Measurements',
      startDate: addDays(new Date(), 61),
      endDate: addDays(new Date(), 63),
      progress: 0,
      status: 'pending',
      assignee: 'WM',
      duration: '3 days',
      category: 'Measurement',
      parentId: 'parent-2.3'
    },
    {
      id: 'child-2.3.2',
      name: 'Curtain Installation',
      startDate: addDays(new Date(), 64),
      endDate: addDays(new Date(), 67),
      progress: 0,
      status: 'pending',
      assignee: 'CI',
      duration: '4 days',
      category: 'Installation',
      parentId: 'parent-2.3'
    },
    {
      id: 'child-2.3.3',
      name: 'Blind Installation',
      startDate: addDays(new Date(), 68),
      endDate: addDays(new Date(), 70),
      progress: 0,
      status: 'pending',
      assignee: 'BI',
      duration: '3 days',
      category: 'Installation',
      parentId: 'parent-2.3'
    },

    // ============ STAGE 3: QUALITY & COMPLETION ============
    {
      id: 'stage-3',
      name: 'QUALITY & COMPLETION PHASE',
      startDate: addDays(new Date(), 81),
      endDate: addDays(new Date(), 95),
      progress: 0,
      status: 'pending',
      assignee: 'QM',
      duration: '15 days',
      category: 'Quality',
      isStage: true
    },
    {
      id: 'parent-3.1',
      name: 'Final Inspections',
      startDate: addDays(new Date(), 81),
      endDate: addDays(new Date(), 88),
      progress: 0,
      status: 'pending',
      assignee: 'FI',
      duration: '8 days',
      category: 'Inspection',
      parentId: 'stage-3'
    },
    {
      id: 'child-3.1.1',
      name: 'Structural Inspection',
      startDate: addDays(new Date(), 81),
      endDate: addDays(new Date(), 83),
      progress: 0,
      status: 'pending',
      assignee: 'SI',
      duration: '3 days',
      category: 'Structural',
      parentId: 'parent-3.1'
    },
    {
      id: 'child-3.1.2',
      name: 'Electrical Inspection',
      startDate: addDays(new Date(), 84),
      endDate: addDays(new Date(), 86),
      progress: 0,
      status: 'pending',
      assignee: 'EI',
      duration: '3 days',
      category: 'Electrical',
      parentId: 'parent-3.1'
    },
    {
      id: 'child-3.1.3',
      name: 'Safety Compliance Check',
      startDate: addDays(new Date(), 87),
      endDate: addDays(new Date(), 88),
      progress: 0,
      status: 'pending',
      assignee: 'SC',
      duration: '2 days',
      category: 'Safety',
      parentId: 'parent-3.1'
    },
    {
      id: 'parent-3.2',
      name: 'Documentation & Handover',
      startDate: addDays(new Date(), 89),
      endDate: addDays(new Date(), 95),
      progress: 0,
      status: 'pending',
      assignee: 'DH',
      duration: '7 days',
      category: 'Documentation',
      parentId: 'stage-3'
    },
    {
      id: 'child-3.2.1',
      name: 'Project Documentation',
      startDate: addDays(new Date(), 89),
      endDate: addDays(new Date(), 91),
      progress: 0,
      status: 'pending',
      assignee: 'PD',
      duration: '3 days',
      category: 'Documentation',
      parentId: 'parent-3.2'
    },
    {
      id: 'child-3.2.2',
      name: 'Warranty Setup',
      startDate: addDays(new Date(), 92),
      endDate: addDays(new Date(), 93),
      progress: 0,
      status: 'pending',
      assignee: 'WS',
      duration: '2 days',
      category: 'Legal',
      parentId: 'parent-3.2'
    },
    {
      id: 'child-3.2.3',
      name: 'Client Handover',
      startDate: addDays(new Date(), 94),
      endDate: addDays(new Date(), 95),
      progress: 0,
      status: 'pending',
      assignee: 'CH',
      duration: '2 days',
      category: 'Handover',
      parentId: 'parent-3.2'
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

  const handleTaskReorder = (reorderedTasks: ModernGanttTask[]) => {
    setTasks(reorderedTasks);
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
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {renderHeaderControls()}
      
      <div className="flex-1 p-4 overflow-hidden w-full">
        {selectedView === 'gantt' ? (
          <div className="w-full h-full overflow-hidden">{/* Prevent any overflow */}
            <Card className="shadow-lg w-full h-full">
              <CardContent className="p-0 overflow-hidden h-full">
          <ModernGanttChart 
            tasks={tasks} 
            onTaskUpdate={handleTaskUpdate}
            onTaskAdd={handleTaskAdd}
            onTaskDelete={handleTaskDelete}
            onTaskReorder={handleTaskReorder}
          />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
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
        <div className="flex-1 backdrop-blur-xl bg-white/95 h-full overflow-hidden">
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
        <div className="flex-1 backdrop-blur-xl bg-white/95 border-l border-white/10 h-full overflow-hidden">
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
      <div className="flex-1 ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10 animate-fade-in h-full overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
};
