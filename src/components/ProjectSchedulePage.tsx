import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    // AI Agent can call this function to update tasks
    setGanttTasks(prev => {
      const updateTaskRecursively = (tasks: GanttTask[]): GanttTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates };
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

  const flatTasks = flattenTasks(ganttTasks);
  const timelineWeeks = getTimelineWeeks();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('project-detail')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Project</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Schedule - Gantt Chart</h1>
              <p className="text-gray-600">{project.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => addTask()} 
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>
      </div>

      {/* SmartSheet-style Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <div className="w-full min-w-[1200px]">
          {/* Table Header */}
          <div className="flex bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            {/* Left Grid Headers */}
            <div className="flex bg-gray-50 border-r border-gray-200">
              <div className="w-8 px-2 py-3 text-xs font-medium text-gray-700 border-r border-gray-200"></div>
              <div className="w-80 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200">Name</div>
              <div className="w-20 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200">Duration</div>
              <div className="w-24 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200">Start Date</div>
              <div className="w-24 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200">End Date</div>
              <div className="w-20 px-3 py-3 text-xs font-medium text-gray-700 border-r border-gray-200">Predecessor</div>
            </div>
            
            {/* Timeline Headers */}
            <div className="flex bg-gray-50">
              {timelineWeeks.map((week, index) => (
                <div key={index} className="w-[200px] px-2 py-1 border-r border-gray-200 text-center">
                  <div className="text-xs font-medium text-gray-700">
                    {week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                      <span key={dayIndex} className="w-6 text-center">{day}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="bg-white">
            {flatTasks.map((task, rowIndex) => (
              <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 group">
                {/* Left Grid Cells */}
                <div className="flex bg-white border-r border-gray-200">
                  {/* Row Number */}
                  <div className="w-8 px-2 py-2 text-xs text-gray-500 border-r border-gray-200 text-center">
                    {rowIndex + 1}
                  </div>
                  
                  {/* Task Name */}
                  <div className="w-80 px-3 py-2 border-r border-gray-200 flex items-center">
                    <div className="flex items-center" style={{ marginLeft: `${task.level * 20}px` }}>
                      {task.children && task.children.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(task.id)}
                          className="mr-2 p-1 hover:bg-gray-200 rounded"
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
                          className="h-6 text-xs border-none p-0 focus:ring-0"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="text-xs cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingTask(task.id)}
                        >
                          {task.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Duration */}
                  <div className="w-20 px-3 py-2 text-xs text-gray-700 border-r border-gray-200 text-center">
                    {task.duration}d
                  </div>
                  
                  {/* Start Date */}
                  <div className="w-24 px-3 py-2 text-xs text-gray-700 border-r border-gray-200">
                    {new Date(task.startDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </div>
                  
                  {/* End Date */}
                  <div className="w-24 px-3 py-2 text-xs text-gray-700 border-r border-gray-200">
                    {new Date(task.endDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </div>
                  
                  {/* Predecessor */}
                  <div className="w-20 px-3 py-2 text-xs text-gray-700 border-r border-gray-200 text-center">
                    {task.predecessor}
                  </div>
                </div>
                
                {/* Timeline Cells */}
                <div className="flex">
                  {timelineWeeks.map((week, weekIndex) => {
                    const barStyle = getTaskBarStyle(task, week);
                    return (
                      <div key={weekIndex} className="w-[200px] h-8 border-r border-gray-100 relative">
                        {/* Weekend shading */}
                        <div className="absolute right-0 top-0 w-[28.5%] h-full bg-gray-100 opacity-30"></div>
                        
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
