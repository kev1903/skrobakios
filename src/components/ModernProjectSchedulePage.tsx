import React, { useState, useEffect } from 'react';
import { Filter, Plus, MoreHorizontal, Download, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import { IndentDecrease, IndentIncrease, Baseline, Settings, Expand } from 'lucide-react';
import { Bold, Italic, Underline, Strikethrough, Link, AlignLeft } from 'lucide-react';
import { DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/hooks/useProjects';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { TaskListPanel } from '@/components/schedule/TaskListPanel';
import { TimelinePanel } from '@/components/schedule/TimelinePanel';
import { ModernGanttTask, TimelineHeader } from '@/components/schedule/types';
import { 
  generateTimelineHeaders, 
  updateTaskWithCalculations, 
  generateTaskColor,
  calculateBarPosition,
  validateDependencies,
  autoScheduleTask,
  flattenTasks,
  calculateProjectStats,
  assignRowNumbers,
  parseDependencies,
  formatDependencies
} from '@/components/schedule/utils';
import { WBSService } from '@/services/wbsService';
import { WBSItem } from '@/types/wbs';
import { useToast } from '@/hooks/use-toast';

interface ModernProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ModernProjectSchedulePage = ({ project, onNavigate }: ModernProjectSchedulePageProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingField, setEditingField] = useState<{taskId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [timelineHeader, setTimelineHeader] = useState<TimelineHeader>(generateTimelineHeaders());
  const [taskListWidth, setTaskListWidth] = useState(600);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Task data loaded from database
  const [tasks, setTasks] = useState<ModernGanttTask[]>([]);

  // Load WBS items from database
  const loadWBSItems = async () => {
    try {
      setLoading(true);
      const wbsItems = await WBSService.loadWBSItems(project.id);
      const ganttTasks = convertWBSToGanttTasks(wbsItems);
      setTasks(ganttTasks);
      
      // Set initial expanded tasks
      const parentTaskIds = ganttTasks
        .filter(task => task.children && task.children.length > 0)
        .map(task => task.id);
      setExpandedTasks(new Set(parentTaskIds));
    } catch (error) {
      console.error('Error loading WBS items:', error);
      toast({
        title: "Error",
        description: "Failed to load project schedule data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert WBS items to Gantt tasks format
  const convertWBSToGanttTasks = (wbsItems: WBSItem[]): ModernGanttTask[] => {
    const convertItem = (item: WBSItem): ModernGanttTask => ({
      id: item.id,
      title: item.title,
      duration: item.duration || 1,
      status: item.progress || 0,
      startDate: item.start_date || new Date().toISOString().split('T')[0],
      endDate: item.end_date || new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dependencies: [], // Parse from linked_tasks if needed
      level: item.level,
      expanded: item.is_expanded,
      children: item.children ? item.children.map(convertItem) : undefined,
      wbsId: item.id // Store original WBS ID for database operations
    });

    return wbsItems.map(convertItem);
  };

  // Load data on component mount
  useEffect(() => {
    loadWBSItems();
  }, [project.id]);

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const flattenTasksLocal = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
    const result: ModernGanttTask[] = [];
    
    for (const task of tasks) {
      if (hideCompleted && task.status === 100) continue;
      
      result.push(task);
      if (task.children && expandedTasks.has(task.id)) {
        result.push(...flattenTasksLocal(task.children));
      }
    }
    
    return result;
  };

  const updateTask = async (taskId: string, field: string, value: string | number) => {
    setTasks(prevTasks => {
      const updateTaskRecursively = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            let updatedTask = { ...task };
            
            if (field === 'dependencies') {
              const dependencies = parseDependencies(String(value));
              const { isValid, conflicts } = validateDependencies(prevTasks, task.rowNumber!, dependencies);
              
              if (isValid) {
                updatedTask.dependencies = dependencies;
                // Auto-schedule task based on new dependencies
                updatedTask = autoScheduleTask(updatedTask, flattenTasksLocal(prevTasks));
              } else {
                console.warn('Dependency validation failed:', conflicts);
                toast({
                  title: "Invalid Dependencies",
                  description: "Please check your dependency references.",
                  variant: "destructive",
                });
                return task; // Return unchanged task
              }
            } else if (field === 'duration' || field === 'startDate' || field === 'endDate') {
              updatedTask = updateTaskWithCalculations(
                task, 
                field as 'duration' | 'startDate' | 'endDate', 
                value,
                timelineHeader.startDate,
                timelineHeader.endDate,
                flattenTasksLocal(prevTasks)
              );
            } else {
              // Handle other field updates
              if (field === 'title') {
                updatedTask.title = String(value);
              } else if (field === 'status') {
                updatedTask.status = Number(value);
              }
            }
            
            return updatedTask;
          }
          if (task.children) {
            return { ...task, children: updateTaskRecursively(task.children) };
          }
          return task;
        });
      };
      return updateTaskRecursively(prevTasks);
    });

    // Update database if task has wbsId
    const task = findTaskById(taskId);
    if (task?.wbsId) {
      try {
        const updates: any = {};
        
        if (field === 'title') {
          updates.title = String(value);
        } else if (field === 'duration') {
          updates.duration = Number(value);
        } else if (field === 'startDate') {
          updates.start_date = String(value);
        } else if (field === 'endDate') {
          updates.end_date = String(value);
        } else if (field === 'status') {
          updates.progress = Number(value);
        }

        await WBSService.updateWBSItem(task.wbsId, updates);
        
        toast({
          title: "Updated",
          description: `${field} updated successfully.`,
        });
      } catch (error) {
        console.error('Error updating WBS item:', error);
        toast({
          title: "Error",
          description: "Failed to save changes to database.",
          variant: "destructive",
        });
      }
    }
  };

  // Helper function to find a task by ID
  const findTaskById = (taskId: string): ModernGanttTask | null => {
    const searchTasks = (tasks: ModernGanttTask[]): ModernGanttTask | null => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        if (task.children) {
          const found = searchTasks(task.children);
          if (found) return found;
        }
      }
      return null;
    };
    return searchTasks(tasks);
  };

  // Initialize bar styles for tasks with dates
  useEffect(() => {
    setTasks(prevTasks => {
      const updateBarStyles = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
        return tasks.map(task => {
          if (task.startDate && task.endDate && task.level > 0) {
            const barPosition = calculateBarPosition(
              task.startDate,
              task.endDate,
              timelineHeader.startDate,
              timelineHeader.endDate
            );
            return {
              ...task,
              barStyle: {
                ...barPosition,
                backgroundColor: task.barStyle?.backgroundColor || generateTaskColor(task.id)
              },
              children: task.children ? updateBarStyles(task.children) : undefined
            };
          }
          return {
            ...task,
            children: task.children ? updateBarStyles(task.children) : undefined
          };
        });
      };
      return updateBarStyles(prevTasks);
    });
  }, [timelineHeader]);

  // Auto-assign row numbers when tasks change
  useEffect(() => {
    setTasks(prevTasks => assignRowNumbers(prevTasks));
  }, []);

  const startEditing = (taskId: string, field: string, currentValue: string | number) => {
    setEditingField({ taskId, field });
    setEditingValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const { taskId, field } = editingField;
    let value: string | number = editingValue;
    
    if (field === 'status') {
      value = Math.max(0, Math.min(100, parseInt(editingValue) || 0));
    } else if (field === 'duration') {
      value = Math.max(1, parseInt(editingValue) || 1);
    } else if (field === 'dependencies') {
      // Keep as string for parsing later
      value = editingValue;
    }
    
    updateTask(taskId, field, value);
    setEditingField(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination || destination.index === source.index) {
      return;
    }

    const newFlatTasks = Array.from(flatTasks);
    const [reorderedTask] = newFlatTasks.splice(source.index, 1);
    newFlatTasks.splice(destination.index, 0, reorderedTask);

    // Rebuild the task hierarchy
    rebuildTaskHierarchy(newFlatTasks);
  };

  const rebuildTaskHierarchy = (flatTaskList: ModernGanttTask[]) => {
    // This is a simplified rebuild - in a real app you'd need more sophisticated logic
    // to maintain proper parent-child relationships
    const newTasks: ModernGanttTask[] = [];
    
    for (const task of flatTaskList) {
      if (task.level === 0) {
        const parentTask = { ...task, children: [] };
        // Find all children for this parent
        for (const childTask of flatTaskList) {
          if (childTask.level === 1 && flatTaskList.indexOf(childTask) > flatTaskList.indexOf(task)) {
            const nextParentIndex = flatTaskList.findIndex((t, i) => 
              i > flatTaskList.indexOf(childTask) && t.level === 0
            );
            if (nextParentIndex === -1 || nextParentIndex > flatTaskList.indexOf(childTask)) {
              parentTask.children!.push(childTask);
            }
          }
        }
        newTasks.push(parentTask);
      }
    }
    
    setTasks(newTasks);
  };

  const addTask = (parentId?: string) => {
    const newTask: ModernGanttTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      duration: 1,
      status: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dependencies: [],
      level: parentId ? 1 : 0,
    };

    setTasks(prevTasks => {
      if (!parentId) {
        return [...prevTasks, newTask];
      }
      
      const addToParent = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
        return tasks.map(task => {
          if (task.id === parentId) {
            const children = task.children || [];
            return { 
              ...task, 
              children: [...children, { ...newTask, level: task.level + 1 }],
              expanded: true 
            };
          }
          if (task.children) {
            return { ...task, children: addToParent(task.children) };
          }
          return task;
        });
      };
      return addToParent(prevTasks);
    });

    setExpandedTasks(prev => parentId ? new Set([...prev, parentId]) : prev);
    
    // Reassign row numbers after adding new task
    setTasks(currentTasks => assignRowNumbers(currentTasks));
  };

  const flatTasks = flattenTasksLocal(tasks);
  const projectStats = calculateProjectStats(tasks);

  const getProjectStatusColor = (status: string) => {
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

  const getProjectStatusText = (status: string) => {
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

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getProjectStatusColor}
        getStatusText={getProjectStatusText}
        activeSection="schedule"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10">
        {/* Top Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-slate-900">
              {project.name || 'Untitled Project'}
            </h1>
            <button className="text-slate-400 hover:text-slate-600">
              ⭐
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => addTask()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideCompleted(!hideCompleted)}
                className="flex items-center space-x-1"
              >
                {hideCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>Hide Completed</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              
              <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">
                Color: Progress
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" title="Outdent" className="h-8 w-8 p-0">
              <IndentDecrease className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Indent" className="h-8 w-8 p-0">
              <IndentIncrease className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Button variant="ghost" size="sm" title="Bold" className="h-8 w-8 p-0">
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Italic" className="h-8 w-8 p-0">
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Underline" className="h-8 w-8 p-0">
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Strikethrough" className="h-8 w-8 p-0">
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Link" className="h-8 w-8 p-0">
              <Link className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Align Left" className="h-8 w-8 p-0">
              <AlignLeft className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Button variant="ghost" size="sm" title="Zoom In" className="h-8 w-8 p-0">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Zoom Out" className="h-8 w-8 p-0">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Button variant="ghost" size="sm" title="Baseline">
              <Baseline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Critical Path">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </Button>
            <Button variant="ghost" size="sm" title="Settings">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Expand All">
              <Expand className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Enhanced Gantt Chart */}
        <div className="flex-1 flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading schedule data...</p>
              </div>
            </div>
          ) : (
            <>
              <TaskListPanel
                tasks={flatTasks}
                expandedTasks={expandedTasks}
                editingField={editingField}
                editingValue={editingValue}
                onToggleExpanded={toggleExpanded}
                onStartEditing={startEditing}
                onEditingValueChange={setEditingValue}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onDragEnd={handleDragEnd}
                width={taskListWidth}
              />

              {/* Resizable Divider */}
              <div
                className="w-1 bg-slate-300 hover:bg-blue-400 cursor-col-resize transition-colors relative group"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = taskListWidth;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const diff = e.clientX - startX;
                    const newWidth = Math.max(300, Math.min(1000, startWidth + diff));
                    setTaskListWidth(newWidth);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                  <div className="w-3 h-8 bg-slate-400 group-hover:bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-0.5 h-4 bg-white rounded"></div>
                  </div>
                </div>
              </div>

              <TimelinePanel
                tasks={flatTasks}
                timelineHeader={timelineHeader}
                scrollPosition={scrollPosition}
                onScroll={setScrollPosition}
              />
            </>
          )}
        </div>

        {/* Bottom Status Bar with Enhanced Project Stats */}
        <div className="h-12 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-6 text-sm text-slate-600">
          <div className="flex items-center space-x-4">
            <span>{projectStats.totalTasks} tasks</span>
            <span>•</span>
            <span>{projectStats.completedTasks} completed</span>
            <span>•</span>
            <span>{projectStats.remainingTasks} remaining</span>
            {projectStats.criticalPath.length > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-medium">Critical path: {projectStats.criticalPath.length} tasks</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Overall Progress:</span>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${projectStats.averageProgress}%` }}
              ></div>
            </div>
            <span className="font-medium text-slate-900">
              {projectStats.averageProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};