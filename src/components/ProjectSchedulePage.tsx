
import React, { useState, useEffect, useRef } from "react";
import { ProjectSidebar } from "./ProjectSidebar";
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Save, Edit2, Search, Download, Filter, CalendarIcon, Settings, MoreVertical, Trash, Eye, EyeOff, Lock, Unlock, BarChart3, FileText, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Project } from "@/hooks/useProjects";

interface GanttTask {
  id: string;
  name: string;
  duration: number;
  startDate: string;
  endDate: string;
  predecessor: string;
  level: number;
  children?: GanttTask[];
  expanded?: boolean;
  assignee?: string;
  progress?: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
}

interface ProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSchedulePage = ({ project, onNavigate }: ProjectSchedulePageProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['preliminaries', 'site-work', 'order-material']));
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    column?: string;
  }>({ show: false, x: 0, y: 0 });
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    rowNumber: 32,    // w-8 = 32px
    name: 320,        // w-80 = 320px
    duration: 80,     // w-20 = 80px
    startDate: 96,    // w-24 = 96px
    endDate: 96,      // w-24 = 96px
    predecessor: 80   // w-20 = 80px
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [columnNames, setColumnNames] = useState({
    name: 'Name',
    duration: 'Duration (Auto)',
    startDate: 'Start Date',
    endDate: 'End Date',
    predecessor: 'Predecessor'
  });
  const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');

  // Refs for synchronized scrolling
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Synchronized scrolling effect
  useEffect(() => {
    const leftElement = leftScrollRef.current;
    const rightElement = rightScrollRef.current;

    if (!leftElement || !rightElement) return;

    const syncScrollLeft = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        rightElement.scrollTop = leftElement.scrollTop;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 0);
      }
    };

    const syncScrollRight = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        leftElement.scrollTop = rightElement.scrollTop;
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 0);
      }
    };

    leftElement.addEventListener('scroll', syncScrollLeft);
    rightElement.addEventListener('scroll', syncScrollRight);

    return () => {
      leftElement.removeEventListener('scroll', syncScrollLeft);
      rightElement.removeEventListener('scroll', syncScrollRight);
    };
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu({ show: false, x: 0, y: 0 });
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle resizer drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const container = document.querySelector('.schedule-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit between 20% and 80%
      const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle column resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      
      const header = document.querySelector(`[data-column="${resizingColumn}"]`);
      if (!header) return;
      
      const headerRect = header.getBoundingClientRect();
      const newWidth = e.clientX - headerRect.left;
      
      // Minimum width of 50px
      const clampedWidth = Math.max(newWidth, 50);
      
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: clampedWidth
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn]);

  // SmartSheet-style hierarchical task data matching the reference image
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([
    {
      id: "start-date",
      name: "Start date",
      duration: 82,
      startDate: "2016-10-20",
      endDate: "2017-02-17",
      predecessor: "",
      level: 0,
      status: "completed"
    },
    {
      id: "preliminaries",
      name: "Preliminaries",
      duration: 5,
      startDate: "2016-10-20",
      endDate: "2016-10-26",
      predecessor: "",
      level: 0,
      expanded: true,
      status: "completed",
      children: [
        {
          id: "send-plans",
          name: "Send plans and purchase orders",
          duration: 1,
          startDate: "2016-10-20",
          endDate: "2016-10-20",
          predecessor: "",
          level: 1,
          status: "completed"
        },
        {
          id: "checklist-job",
          name: "Checklist for job file",
          duration: 1,
          startDate: "2016-10-20",
          endDate: "2016-10-20",
          predecessor: "",
          level: 1,
          status: "completed"
        },
        {
          id: "check-damaged",
          name: "Check for damaged council assets",
          duration: 1,
          startDate: "2016-10-20",
          endDate: "2016-10-20",
          predecessor: "",
          level: 1,
          status: "completed"
        },
        {
          id: "send-pic",
          name: "Send PIC to Drainer and order",
          duration: 1,
          startDate: "2016-10-20",
          endDate: "2016-10-20",
          predecessor: "",
          level: 1,
          status: "completed"
        }
      ]
    },
    {
      id: "site-work",
      name: "Site work",
      duration: 1,
      startDate: "2016-10-26",
      endDate: "2016-10-26",
      predecessor: "",
      level: 0,
      expanded: true,
      status: "completed",
      children: [
        {
          id: "organise-company",
          name: "Organise company sign",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        }
      ]
    },
    {
      id: "order-hire",
      name: "Order hire equipment",
      duration: 1,
      startDate: "2016-10-26",
      endDate: "2016-10-26",
      predecessor: "",
      level: 0,
      expanded: true,
      status: "completed",
      children: [
        {
          id: "order-toilet",
          name: "Order toilet",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-fence",
          name: "Order fence",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-crossover",
          name: "Order crossover",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-bin",
          name: "Order bin cage",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        }
      ]
    },
    {
      id: "order-material",
      name: "Order material",
      duration: 1,
      startDate: "2016-10-26",
      endDate: "2016-10-26",
      predecessor: "",
      level: 0,
      expanded: true,
      status: "completed",
      children: [
        {
          id: "order-lime",
          name: "Order L/ME for retaining wall",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-windows",
          name: "Order windows",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-trusses",
          name: "Order trusses",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "order-wall-frame",
          name: "Order wall frame material",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        },
        {
          id: "reserve-bricks",
          name: "Reserve bricks",
          duration: 1,
          startDate: "2016-10-26",
          endDate: "2016-10-26",
          predecessor: "3FS",
          level: 1,
          status: "completed"
        }
      ]
    },
    {
      id: "order-labour",
      name: "Order labour",
      duration: 1,
      startDate: "2016-10-26",
      endDate: "2016-10-26",
      predecessor: "",
      level: 0,
      status: "completed"
    },
    {
      id: "base-stage",
      name: "Base Stage",
      duration: 18,
      startDate: "2016-11-01",
      endDate: "2016-11-24",
      predecessor: "",
      level: 0,
      status: "in-progress"
    },
    {
      id: "frame-stage",
      name: "Frame Stage",
      duration: 5,
      startDate: "2016-11-23",
      endDate: "2016-11-29",
      predecessor: "",
      level: 0,
      status: "not-started"
    },
    {
      id: "lockup",
      name: "Lockup",
      duration: 16,
      startDate: "2016-11-25",
      endDate: "2016-12-16",
      predecessor: "",
      level: 0,
      status: "not-started"
    }
  ]);

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

  const calculateWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // Count Monday (1) through Friday (5) as working days
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };

  const flattenTasks = (tasks: GanttTask[]): GanttTask[] => {
    const result: GanttTask[] = [];
    
    for (const task of tasks) {
      result.push(task);
      if (task.children && expandedTasks.has(task.id)) {
        result.push(...flattenTasks(task.children));
      }
    }
    
    return result;
  };

  const getTimelineWeeks = () => {
    const weeks = [];
    const startDate = new Date('2016-10-17');
    const endDate = new Date('2016-11-28');
    
    let current = new Date(startDate);
    while (current <= endDate) {
      weeks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  };

  const getTaskBarStyle = (task: GanttTask, weekStart: Date) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Check if task overlaps with this week
    if (taskStart > weekEnd || taskEnd < weekStart) {
      return null;
    }
    
    // Calculate position and width within the week
    const weekWidth = 200; // Fixed width for each week column
    const daysInWeek = 7;
    const dayWidth = weekWidth / daysInWeek;
    
    const startOffset = Math.max(0, (taskStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(daysInWeek, (taskEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24) + 1);
    
    if (endOffset <= startOffset) return null;
    
    return {
      left: `${startOffset * dayWidth}px`,
      width: `${(endOffset - startOffset) * dayWidth}px`,
      backgroundColor: task.status === 'completed' ? '#10b981' : 
                     task.status === 'in-progress' ? '#f59e0b' : '#6b7280'
    };
  };

  const updateTask = (taskId: string, updates: Partial<GanttTask>) => {
    setGanttTasks(prev => {
      const updateTaskRecursively = (tasks: GanttTask[]): GanttTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task, ...updates };
            
            // Auto-calculate duration when start or end date changes
            if (updates.startDate || updates.endDate) {
              const startDate = updates.startDate || task.startDate;
              const endDate = updates.endDate || task.endDate;
              updatedTask.duration = calculateWorkingDays(startDate, endDate);
            }
            
            return updatedTask;
          }
          if (task.children) {
            return { ...task, children: updateTaskRecursively(task.children) };
          }
          return task;
        });
      };
      return updateTaskRecursively(prev);
    });
  };

  const handleCellEdit = (taskId: string, field: string) => {
    // Don't allow editing of duration as it's auto-calculated
    if (field === 'duration') return;
    
    if (field === 'startDate' || field === 'endDate') {
      setDatePickerOpen(`${taskId}-${field}`);
    } else {
      setEditingTask(taskId);
      setEditingField(field);
    }
  };

  const handleCellBlur = () => {
    setEditingTask(null);
    setEditingField(null);
    setDatePickerOpen(null);
  };

  const renderEditableCell = (task: GanttTask, field: string, value: any, className: string) => {
    const isEditing = editingTask === task.id && editingField === field;
    const isDatePickerOpen = datePickerOpen === `${task.id}-${field}`;
    
    if (isEditing && field !== 'duration') {
      return (
        <Input
          value={value}
          onChange={(e) => updateTask(task.id, { [field]: e.target.value })}
          onBlur={handleCellBlur}
          className="h-full w-full text-xs bg-transparent focus:ring-0 focus:outline-none"
          style={{ 
            border: 'none', 
            outline: 'none', 
            boxShadow: 'none',
            background: 'transparent'
          }}
          autoFocus
        />
      );
    }

    if (field === 'startDate' || field === 'endDate') {
      return (
        <Popover open={isDatePickerOpen} onOpenChange={(open) => {
          if (!open) {
            setDatePickerOpen(null);
          }
        }}>
          <PopoverTrigger asChild>
            <div 
              className={`${className} cursor-pointer hover:bg-muted/20 transition-colors h-full w-full flex items-center`}
              onClick={() => handleCellEdit(task.id, field)}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {value ? format(new Date(value), "dd/MM/yy") : 'Pick date'}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => {
                if (date) {
                  updateTask(task.id, { [field]: format(date, 'yyyy-MM-dd') });
                }
                setDatePickerOpen(null);
              }}
              disabled={(date) => {
                // For start date: cannot be after end date
                if (field === 'startDate' && task.endDate) {
                  return date > new Date(task.endDate);
                }
                // For end date: cannot be before start date
                if (field === 'endDate' && task.startDate) {
                  return date < new Date(task.startDate);
                }
                return false;
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <div 
        className={`${className} ${field === 'duration' ? '' : 'cursor-pointer hover:bg-muted/20'} transition-colors h-full w-full flex items-center`}
        onClick={() => handleCellEdit(task.id, field)}
      >
        {field === 'duration' ? `${value}d` : value}
      </div>
    );
  };

  const addTask = (parentId?: string) => {
    // AI Agent can call this function to add new tasks
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: "New Task",
      duration: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      predecessor: "",
      level: parentId ? 1 : 0,
      status: "not-started"
    };
    
    if (parentId) {
      updateTask(parentId, { 
        children: [...(ganttTasks.find(t => t.id === parentId)?.children || []), newTask] 
      });
    } else {
      setGanttTasks(prev => [...prev, newTask]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      column
    });
  };

  const handleContextMenuAction = (action: string) => {
    const { column } = contextMenu;
    console.log(`Action: ${action} on column: ${column}`);
    
    switch (action) {
      case 'insert-left':
        // Add column to the left
        break;
      case 'insert-right':
        // Add column to the right
        break;
      case 'delete-column':
        // Delete column
        break;
      case 'rename-column':
        if (column && column !== 'rowNumber') {
          setRenamingColumn(column);
          setNewColumnName(columnNames[column as keyof typeof columnNames] || '');
        }
        break;
      case 'add-description':
        // Add column description
        break;
      case 'filter':
        // Filter column
        break;
      case 'sort-rows':
        // Sort rows
        break;
      case 'lock-column':
        // Lock column
        break;
      case 'freeze-column':
        // Freeze column
        break;
      case 'hide-column':
        // Hide column
        break;
      case 'show-gantt':
        // Show/hide gantt
        break;
      case 'edit-project-settings':
        onNavigate('schedule-settings');
        break;
      case 'expand-all':
        setExpandedTasks(new Set(ganttTasks.map(t => t.id)));
        break;
      case 'collapse-all':
        setExpandedTasks(new Set());
        break;
      case 'edit-column-properties':
        // Edit column properties
        break;
    }
    
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  const flatTasks = flattenTasks(ganttTasks);
  const timelineWeeks = getTimelineWeeks();

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

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="schedule"
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10 overflow-hidden">
        {/* Header */}
        <div className="glass-card border-b border-border px-4 md:px-6 py-3 md:py-4 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('individual-project-dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Project</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-poppins font-bold text-foreground heading-modern truncate">Project Schedule</h1>
                <p className="text-sm text-muted-foreground body-modern truncate">{project.name} - Timeline View</p>
              </div>
            </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('schedule-settings')}
              className="flex items-center space-x-2 glass-hover border-border hover:border-primary transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button
              onClick={() => addTask()} 
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 py-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-light border-b border-border px-4 md:px-6 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between overflow-x-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-4 md:space-x-8 min-w-max">
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Overview</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>List</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Board</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">
              <span>Timeline</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Calendar</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Workflow</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Dashboard</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Messages</span>
            </button>
            <button className="flex items-center space-x-2 px-1 py-2 md:py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted transition-colors whitespace-nowrap">
              <span>Files</span>
            </button>
          </div>
          
          {/* Export Button */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="h-9 text-sm glass-hover border-border hover:border-primary transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        </div>

        {/* Main Content - Split Layout - Extended to bottom of screen with no gaps */}
        <div className="flex-1 bg-background schedule-container" style={{ height: 'calc(100vh - 120px)', minHeight: 'calc(100vh - 120px)' }}>
        <div className="flex h-full min-h-full">
          {/* Left Side - Data Table */}
          <div 
            ref={leftScrollRef}
            className="border-r border-border overflow-auto" 
            style={{ width: `${leftWidth}%` }}
          >
            {/* Table Header - Updated with solid background */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
              <div className="flex">
                <div 
                  className="px-2 py-3 text-xs font-medium text-muted-foreground border-r border-border relative"
                  style={{ width: `${columnWidths.rowNumber}px` }}
                  data-column="rowNumber"
                >
                  {/* Row number column resize handle */}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={() => setResizingColumn('rowNumber')}
                  ></div>
                </div>
                
                <div 
                  className="px-3 py-3 text-xs font-medium text-foreground border-r border-border cursor-pointer hover:bg-muted/20 transition-colors relative"
                  style={{ width: `${columnWidths.name}px` }}
                  data-column="name"
                  onContextMenu={(e) => handleContextMenu(e, 'name')}
                >
                  {columnNames.name}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingColumn('name');
                    }}
                  ></div>
                </div>
                
                <div 
                  className="px-3 py-3 text-xs font-medium text-foreground border-r border-border cursor-pointer hover:bg-muted/20 transition-colors relative"
                  style={{ width: `${columnWidths.duration}px` }}
                  data-column="duration"
                  onContextMenu={(e) => handleContextMenu(e, 'duration')}
                >
                  {columnNames.duration}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingColumn('duration');
                    }}
                  ></div>
                </div>
                
                <div 
                  className="px-3 py-3 text-xs font-medium text-foreground border-r border-border cursor-pointer hover:bg-muted/20 transition-colors relative"
                  style={{ width: `${columnWidths.startDate}px` }}
                  data-column="startDate"
                  onContextMenu={(e) => handleContextMenu(e, 'startDate')}
                >
                  {columnNames.startDate}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingColumn('startDate');
                    }}
                  ></div>
                </div>
                
                <div 
                  className="px-3 py-3 text-xs font-medium text-foreground border-r border-border cursor-pointer hover:bg-muted/20 transition-colors relative"
                  style={{ width: `${columnWidths.endDate}px` }}
                  data-column="endDate"
                  onContextMenu={(e) => handleContextMenu(e, 'endDate')}
                >
                  {columnNames.endDate}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingColumn('endDate');
                    }}
                  ></div>
                </div>
                
                <div 
                  className="px-3 py-3 text-xs font-medium text-foreground border-r border-border cursor-pointer hover:bg-muted/20 transition-colors relative"
                  style={{ width: `${columnWidths.predecessor}px` }}
                  data-column="predecessor"
                  onContextMenu={(e) => handleContextMenu(e, 'predecessor')}
                >
                  {columnNames.predecessor}
                  <div 
                    className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-primary cursor-col-resize z-20"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizingColumn('predecessor');
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Task Rows */}
            <div className="bg-card">
              {flatTasks.map((task, rowIndex) => (
                <div key={task.id} className="flex border-b border-border hover:bg-muted/50 group transition-colors h-10">
                  {/* Row Number */}
                  <div 
                    className="px-2 py-2 text-xs text-muted-foreground border-r border-border text-center flex items-center justify-center"
                    style={{ width: `${columnWidths.rowNumber}px` }}
                  >
                    {rowIndex + 1}
                  </div>
                  
                  {/* Task Name */}
                  <div 
                    className="px-3 py-2 border-r border-border flex items-center"
                    style={{ width: `${columnWidths.name}px` }}
                  >
                    <div className="flex items-center w-full" style={{ marginLeft: `${task.level * 20}px` }}>
                      {task.children && task.children.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(task.id)}
                          className="mr-2 p-1 hover:bg-muted rounded transition-colors"
                        >
                          {expandedTasks.has(task.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      {editingTask === task.id ? (
                        <Input
                          value={task.name}
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          onBlur={() => setEditingTask(null)}
                          className="h-6 w-full text-xs bg-transparent focus:ring-0 focus:outline-none"
                          style={{ 
                            border: 'none', 
                            outline: 'none', 
                            boxShadow: 'none',
                            background: 'transparent'
                          }}
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-xs cursor-pointer hover:bg-muted/20 transition-colors flex-1 flex items-center"
                          onClick={() => setEditingTask(task.id)}
                        >
                          {task.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div 
                    className="px-3 py-2 border-r border-border text-center flex items-center justify-center"
                    style={{ width: `${columnWidths.duration}px` }}
                  >
                    {renderEditableCell(task, 'duration', task.duration, 'text-xs text-foreground')}
                  </div>
                  
                  {/* Start Date */}
                  <div 
                    className="px-3 py-2 border-r border-border flex items-center"
                    style={{ width: `${columnWidths.startDate}px` }}
                  >
                    {renderEditableCell(task, 'startDate', task.startDate, 'text-xs text-foreground')}
                  </div>
                  
                  {/* End Date */}
                  <div 
                    className="px-3 py-2 border-r border-border flex items-center"
                    style={{ width: `${columnWidths.endDate}px` }}
                  >
                    {renderEditableCell(task, 'endDate', task.endDate, 'text-xs text-foreground')}
                  </div>
                  
                  {/* Predecessor */}
                  <div 
                    className="px-3 py-2 border-r border-border text-center flex items-center justify-center"
                    style={{ width: `${columnWidths.predecessor}px` }}
                  >
                    {renderEditableCell(task, 'predecessor', task.predecessor, 'text-xs text-foreground')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draggable Resizer */}
          <div 
            className="w-1 bg-border hover:bg-primary cursor-col-resize flex-shrink-0 relative group"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="absolute inset-0 w-2 -ml-0.5 group-hover:bg-primary/20 transition-colors"></div>
          </div>

          {/* Right Side - Gantt Chart */}
          <div 
            ref={rightScrollRef}
            className="overflow-auto" 
            style={{ width: `${100 - leftWidth}%` }}
          >
            {/* Gantt Chart Header - Updated with solid background */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
              <div className="flex">
                {timelineWeeks.map((week, index) => (
                  <div key={index} className="w-[200px] px-2 py-1 border-r border-border text-center">
                    <div className="text-xs font-medium text-foreground">
                      {week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                        <span key={dayIndex} className="w-6 text-center">{day}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Chart Rows */}
            <div className="bg-card">
              {flatTasks.map((task, rowIndex) => (
                <div key={task.id} className="flex border-b border-border hover:bg-muted/50 group transition-colors h-10">
                  {timelineWeeks.map((week, weekIndex) => {
                    const barStyle = getTaskBarStyle(task, week);
                    return (
                      <div key={weekIndex} className="w-[200px] h-10 border-r border-border relative">
                        {/* Weekend shading */}
                        <div className="absolute right-0 top-0 w-[28.5%] h-full bg-muted/30 opacity-50"></div>
                        
                        {/* Task Bar */}
                        {barStyle && (
                          <div
                            className="absolute top-1 h-6 rounded-sm flex items-center text-white text-xs font-medium px-1"
                            style={barStyle}
                          >
                            <span className="truncate">{task.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Context Menu */}
        {contextMenu.show && (
          <div
            className="fixed bg-card border border-border rounded-md shadow-lg py-1 z-50 min-w-[200px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ... keep existing context menu content ... */}
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
              Column: {contextMenu.column}
            </div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('insert-left')}
            >
              <Plus className="w-3 h-3" />
              <span>Insert Column Left</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('insert-right')}
            >
              <Plus className="w-3 h-3" />
              <span>Insert Column Right</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2 text-destructive"
              onClick={() => handleContextMenuAction('delete-column')}
            >
              <Trash className="w-3 h-3" />
              <span>Delete Column</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('rename-column')}
            >
              <Edit2 className="w-3 h-3" />
              <span>Rename Column...</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('add-description')}
            >
              <FileText className="w-3 h-3" />
              <span>Add Column Description...</span>
            </button>
            
            <div className="border-t border-border my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('filter')}
            >
              <Filter className="w-3 h-3" />
              <span>Filter...</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('sort-rows')}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Sort Rows...</span>
            </button>
            
            <div className="border-t border-border my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('lock-column')}
            >
              <Lock className="w-3 h-3" />
              <span>Lock Column</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('freeze-column')}
            >
              <Eye className="w-3 h-3" />
              <span>Freeze Column</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('hide-column')}
            >
              <EyeOff className="w-3 h-3" />
              <span>Hide Column</span>
            </button>
            
            <div className="border-t border-border my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('show-gantt')}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Show Gantt</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('edit-project-settings')}
            >
              <Settings className="w-3 h-3" />
              <span>Edit Project Settings...</span>
            </button>
            
            <div className="border-t border-border my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('expand-all')}
            >
              <ChevronDown className="w-3 h-3" />
              <span>Expand All</span>
            </button>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('collapse-all')}
            >
              <ChevronUp className="w-3 h-3" />
              <span>Collapse All</span>
            </button>
            
            <div className="border-t border-border my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 flex items-center space-x-2"
              onClick={() => handleContextMenuAction('edit-column-properties')}
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Column Properties...</span>
            </button>
          </div>
        )}

        {/* Column Rename Dialog */}
        {renamingColumn && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="bg-card border border-border rounded-lg p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Rename Column</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Column Name
                  </label>
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter new column name"
                    className="w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Save the rename
                        setColumnNames(prev => ({
                          ...prev,
                          [renamingColumn]: newColumnName
                        }));
                        setRenamingColumn(null);
                        setNewColumnName('');
                      }
                      if (e.key === 'Escape') {
                        // Cancel rename
                        setRenamingColumn(null);
                        setNewColumnName('');
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRenamingColumn(null);
                      setNewColumnName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setColumnNames(prev => ({
                        ...prev,
                        [renamingColumn]: newColumnName
                      }));
                      setRenamingColumn(null);
                      setNewColumnName('');
                    }}
                    disabled={!newColumnName.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
