import React, { useState, useMemo } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ModernGanttChart, ModernGanttTask } from '@/components/timeline/ModernGanttChart';
import { useScreenSize } from "@/hooks/use-mobile";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Menu, Plus, Filter, Download, BarChart3, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { addDays } from 'date-fns';

interface ProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSchedulePage = ({ project, onNavigate }: ProjectSchedulePageProps) => {
  const screenSize = useScreenSize();
  const { fullHeightClasses } = useMenuBarSpacing('project-schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'gantt' | 'calendar'>('gantt');

  // Sample tasks based on construction project - WBS style
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
      progress: 20,
      status: 'in-progress',
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
      name: 'Foundation Work',
      startDate: addDays(new Date(), 31),
      endDate: addDays(new Date(), 40),
      progress: 30,
      status: 'in-progress',
      assignee: 'FW',
      duration: '10 days',
      category: 'Foundation',
      parentId: 'stage-2'
    },
    {
      id: 'child-2.1.1',
      name: 'Excavation',
      startDate: addDays(new Date(), 31),
      endDate: addDays(new Date(), 35),
      progress: 60,
      status: 'in-progress',
      assignee: 'EX',
      duration: '5 days',
      category: 'Excavation',
      parentId: 'parent-2.1'
    },
    {
      id: 'child-2.1.2',
      name: 'Concrete Pouring',
      startDate: addDays(new Date(), 36),
      endDate: addDays(new Date(), 40),
      progress: 0,
      status: 'pending',
      assignee: 'CP',
      duration: '5 days',
      category: 'Concrete',
      parentId: 'parent-2.1'
    },
    {
      id: 'parent-2.2',
      name: 'Timber Framing',
      startDate: addDays(new Date(), 41),
      endDate: addDays(new Date(), 60),
      progress: 15,
      status: 'pending',
      assignee: 'TF',
      duration: '20 days',
      category: 'Framing',
      parentId: 'stage-2'
    },
    {
      id: 'child-2.2.1',
      name: 'Frame Assembly',
      startDate: addDays(new Date(), 41),
      endDate: addDays(new Date(), 50),
      progress: 25,
      status: 'pending',
      assignee: 'FA',
      duration: '10 days',
      category: 'Assembly',
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
      name: 'Safety Compliance Check',
      startDate: addDays(new Date(), 84),
      endDate: addDays(new Date(), 88),
      progress: 0,
      status: 'pending',
      assignee: 'SC',
      duration: '5 days',
      category: 'Safety',
      parentId: 'parent-3.1'
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

  // Responsive classes based on screen size
  const containerClasses = {
    mobile: "flex flex-col h-screen",
    tablet: "flex flex-col h-screen", 
    desktop: "flex h-screen"
  };

  const mainContentClasses = {
    mobile: "flex-1 min-h-0 overflow-hidden",
    tablet: "flex-1 min-h-0 overflow-hidden",
    desktop: "flex-1 ml-48 min-h-0 overflow-hidden"
  };

  const headerClasses = {
    mobile: "p-4 bg-white border-b border-gray-200",
    tablet: "p-4 bg-white border-b border-gray-200",
    desktop: "p-6 bg-white border-b border-gray-200"
  };

  return (
    <div className={`${containerClasses[screenSize]} ${fullHeightClasses}`}>
      {/* Desktop Sidebar */}
      {screenSize === 'desktop' && (
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={(status: string) => {
            switch (status) {
              case 'active': return 'bg-green-100 text-green-800';
              case 'pending': return 'bg-yellow-100 text-yellow-800';
              case 'completed': return 'bg-blue-100 text-blue-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
          getStatusText={(status: string) => status}
          activeSection="schedule"
        />
      )}

      {/* Main Content Area */}
      <main className={mainContentClasses[screenSize]}>
        {/* Header Banner - Match Scope page */}
        <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-white backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              {(screenSize === 'mobile' || screenSize === 'tablet') && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2"
                    >
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <ProjectSidebar
                      project={project}
                      onNavigate={onNavigate}
                      getStatusColor={(status: string) => {
                        switch (status) {
                          case 'active': return 'bg-green-100 text-green-800';
                          case 'pending': return 'bg-yellow-100 text-yellow-800';
                          case 'completed': return 'bg-blue-100 text-blue-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      }}
                      getStatusText={(status: string) => status}
                      activeSection="schedule"
                    />
                  </SheetContent>
                </Sheet>
              )}

              <div>
                <h1 className="text-2xl font-bold text-foreground font-inter">Project Schedule</h1>
                <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-inter">Schedule Progress</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 bg-green-500"
                      style={{ width: "52%" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground font-inter">52%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Content - Gantt Chart */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden w-full">
            <div className="w-full h-full overflow-hidden">
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
          </div>
        </div>
      </main>
    </div>
  );
};