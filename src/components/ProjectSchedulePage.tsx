import React, { useState, useEffect } from 'react';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ModernGanttChart, ModernGanttTask } from '@/components/timeline/ModernGanttChart';
import { useScreenSize } from "@/hooks/use-mobile";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Menu, ChevronsDown, ChevronsUp, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { addDays } from 'date-fns';
import { useWBS } from '@/hooks/useWBS';
import { WBSItem, WBSItemInput } from '@/types/wbs';
import { flattenWBSHierarchy, generateWBSId } from '@/utils/wbsUtils';
import { useCompany } from '@/contexts/CompanyContext';

interface ProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSchedulePage = ({ project, onNavigate }: ProjectSchedulePageProps) => {
  const screenSize = useScreenSize();
  const { fullHeightClasses } = useMenuBarSpacing('project-schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'gantt' | 'calendar'>('gantt');
  const { currentCompany } = useCompany();
  
  // Use WBS data from the scope table as the main repository
  const { wbsItems, loading, updateWBSItem, createWBSItem, deleteWBSItem } = useWBS(project.id);
  const [tasks, setTasks] = useState<ModernGanttTask[]>([]);

  // Convert WBS items to Gantt tasks (strictly synced with Scope)
  const convertWBSToTasks = (items: WBSItem[]): ModernGanttTask[] => {
    // Build helper maps to derive parentId from WBS code (don't trust parent_id)
    const byWbs = new Map<string, WBSItem>();
    items.forEach(i => byWbs.set(i.wbs_id, i));
    const getParentWbs = (wbsId: string): string | null => {
      const parts = wbsId.split('.');
      if (parts.length <= 2 && parts[1] === '0') return null; // X.0 is root
      if (parts.length === 2) return `${parts[0]}.0`;
      return parts.slice(0, parts.length - 1).join('.');
    };

    const statusFromWBS = (status?: string): ModernGanttTask['status'] => {
      switch (status) {
        case 'Completed': return 'completed';
        case 'In Progress': return 'in-progress';
        case 'On Hold': return 'delayed';
        case 'Delayed': return 'delayed';
        default: return 'pending';
      }
    };

    return items.map(item => {
      const parentWbs = getParentWbs(item.wbs_id);
      const parentItem = parentWbs ? byWbs.get(parentWbs) : undefined;
      const level = item.level ?? 0;

      return {
        id: item.id,
        name: item.title,
        startDate: item.start_date ? new Date(item.start_date) : addDays(new Date(), 0),
        endDate: item.end_date ? new Date(item.end_date) : addDays(new Date(), item.duration || 7),
        progress: item.progress || 0,
        status: statusFromWBS(item.status),
        assignee: item.assigned_to || 'Unassigned',
        duration: `${item.duration || 0} days`,
        category: level === 0 ? 'Stage' : level === 1 ? 'Component' : 'Element',
        isStage: level === 0,
        level,
        wbs: item.wbs_id,
        parentId: parentItem?.id, // derive from WBS path to match Scope hierarchy
        expanded: !!item.is_expanded,
      };
    });
  };

  // Update tasks when WBS items change
  useEffect(() => {
    console.log('📋 WBS items received:', wbsItems?.length || 0, 'items');
    if (wbsItems && wbsItems.length > 0) {
      // Flatten the hierarchical structure to show all levels (Stages, Components, Elements)
      const flattenedItems = flattenWBSHierarchy(wbsItems);
      console.log('📊 Flattened items:', flattenedItems.length, 'total items');
      flattenedItems.forEach(item => console.log(`  ${item.wbs_id}: ${item.title} (Level ${item.level})`));
      
      const convertedTasks = convertWBSToTasks(flattenedItems);
      console.log('🎯 Converted to', convertedTasks.length, 'Gantt tasks');
      setTasks(convertedTasks);
    }
  }, [wbsItems]);

  const handleTaskUpdate = async (taskId: string, updates: Partial<ModernGanttTask>) => {
    // Update local state immediately for responsiveness
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));

    // Convert Gantt updates back to WBS format and update database
    try {
      const wbsUpdates: Partial<WBSItem> = {};
      
      if (updates.name) wbsUpdates.title = updates.name;
      if (updates.progress !== undefined) wbsUpdates.progress = updates.progress;
      if (updates.assignee) wbsUpdates.assigned_to = updates.assignee;
      if (updates.startDate) wbsUpdates.start_date = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate) wbsUpdates.end_date = updates.endDate.toISOString().split('T')[0];
      if (updates.parentId !== undefined) wbsUpdates.parent_id = updates.parentId || null;
      if (updates.expanded !== undefined) wbsUpdates.is_expanded = updates.expanded;
      
      if (updates.status) {
        switch (updates.status) {
          case 'completed': wbsUpdates.status = 'Completed'; break;
          case 'in-progress': wbsUpdates.status = 'In Progress'; break;
          case 'delayed': wbsUpdates.status = 'Delayed'; break;
          default: wbsUpdates.status = 'Not Started'; break;
        }
      }

      if (Object.keys(wbsUpdates).length > 0) {
        await updateWBSItem(taskId, wbsUpdates);
      }
    } catch (error) {
      console.error('Error updating WBS item:', error);
      // Revert the local change if the update failed
      setTasks(prev => convertWBSToTasks(wbsItems || []));
    }
  };

  const handleTaskAdd = async (newTask: Omit<ModernGanttTask, 'id'>) => {
    if (!currentCompany) {
      console.error('No active company selected');
      return;
    }

    try {
      // Convert Gantt task to WBS item format
      const flatWbsItems = wbsItems ? flattenWBSHierarchy(wbsItems) : [];
      const newWbsId = generateWBSId(newTask.parentId, flatWbsItems);
      
      const newWBSItem: WBSItemInput = {
        company_id: currentCompany.id,
        project_id: project.id,
        parent_id: newTask.parentId || null,
        wbs_id: newWbsId,
        title: newTask.name,
        description: '',
        assigned_to: newTask.assignee !== 'Unassigned' ? newTask.assignee : undefined,
        start_date: newTask.startDate.toISOString().split('T')[0],
        end_date: newTask.endDate.toISOString().split('T')[0],
        duration: Math.ceil((newTask.endDate.getTime() - newTask.startDate.getTime()) / (1000 * 3600 * 24)),
        progress: newTask.progress,
        status: newTask.status === 'completed' ? 'Completed' : 
                newTask.status === 'in-progress' ? 'In Progress' : 
                newTask.status === 'delayed' ? 'Delayed' : 'Not Started',
        level: newTask.level,
        category: newTask.category as 'Stage' | 'Component' | 'Element',
        is_expanded: true,
        linked_tasks: []
      };

      await createWBSItem(newWBSItem);
    } catch (error) {
      console.error('Error creating WBS item:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      // Remove from local state immediately for responsiveness
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Delete from database
      await deleteWBSItem(taskId);
    } catch (error) {
      console.error('Error deleting WBS item:', error);
      // Revert the local change if the delete failed
      if (wbsItems) {
        const flattenedItems = flattenWBSHierarchy(wbsItems);
        setTasks(convertWBSToTasks(flattenedItems));
      }
    }
  };

  // Expand and collapse all functions
  const handleExpandAll = () => {
    // Find all tasks with children and expand them
    const tasksWithChildren = new Set<string>();
    const flatTasks = wbsItems ? flattenWBSHierarchy(wbsItems) : [];
    
    flatTasks.forEach(task => {
      const hasChildren = flatTasks.some(t => t.parent_id === task.id);
      if (hasChildren) {
        tasksWithChildren.add(task.id);
      }
    });
    
    // Update the tasks state to mark them as expanded
    setTasks(prev => prev.map(task => ({
      ...task,
      expanded: tasksWithChildren.has(task.id)
    })));
  };

  const handleCollapseAll = () => {
    // Collapse all tasks
    setTasks(prev => prev.map(task => ({
      ...task,
      expanded: false
    })));
  };

  const handleTaskReorder = (reorderedTasks: ModernGanttTask[]) => {
    // For now, just update local state - in a full implementation,
    // this would update the sort order in the database
    setTasks(reorderedTasks);
  };


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
        {/* Header Banner - Responsive */}
        <div className="flex-shrink-0 border-b border-border px-3 sm:px-6 py-3 sm:py-4 bg-white backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
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
                <h1 className="text-xl sm:text-2xl font-bold text-foreground font-inter">Project Schedule</h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-inter">{project.name}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto">
                <div className="text-xs text-muted-foreground font-inter mb-1">Schedule Progress</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 bg-green-500"
                      style={{ width: "52%" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground font-inter">52%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="font-inter text-xs h-7 w-7 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2" 
                  title="Expand All"
                  onClick={handleExpandAll}
                >
                  <ChevronsDown className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">Expand</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="font-inter text-xs h-7 w-7 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2" 
                  title="Collapse All"
                  onClick={handleCollapseAll}
                >
                  <ChevronsUp className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">Collapse</span>
                </Button>
                <Button size="sm" className="font-inter text-xs h-7 w-7 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2" title="Add Task">
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">Add</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Content - Gantt Chart */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden w-full h-full">
            <div className="w-full h-full overflow-hidden">
              <Card className="shadow-lg w-full h-full overflow-hidden">
                <CardContent className="p-0 overflow-hidden h-full w-full">
                  <ModernGanttChart 
                    tasks={tasks} 
                    onTaskUpdate={handleTaskUpdate}
                    onTaskAdd={handleTaskAdd}
                    onTaskDelete={handleTaskDelete}
                    onTaskReorder={handleTaskReorder}
                    onExpandAll={handleExpandAll}
                    onCollapseAll={handleCollapseAll}
                    hideToolbar
                    hideTabs
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