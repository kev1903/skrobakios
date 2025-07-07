import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, Plus, MoreHorizontal, Download, Settings, Eye, EyeOff, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/hooks/useProjects';
import { ProjectSidebar } from '@/components/ProjectSidebar';

interface ModernGanttTask {
  id: string;
  title: string;
  duration: string;
  status: number; // percentage
  startDate?: string;
  endDate?: string;
  level: number;
  children?: ModernGanttTask[];
  expanded?: boolean;
  color?: string;
  barStyle?: {
    left: string;
    width: string;
    backgroundColor: string;
  };
}

interface ModernProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ModernProjectSchedulePage = ({ project, onNavigate }: ModernProjectSchedulePageProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['strategy', 'design', 'development', 'testing']));
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingField, setEditingField] = useState<{taskId: string, field: 'title' | 'duration' | 'status'} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Task data matching the reference image structure
  const [tasks, setTasks] = useState<ModernGanttTask[]>([
    {
      id: 'strategy',
      title: 'Strategy',
      duration: '9 days',
      status: 98,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'goals',
          title: 'Goals',
          duration: '6 days',
          status: 100,
          level: 1,
          barStyle: {
            left: '2%',
            width: '28%',
            backgroundColor: '#3B82F6'
          }
        },
        {
          id: 'target-audience',
          title: 'Target Audience',
          duration: '4 days',
          status: 100,
          level: 1,
          barStyle: {
            left: '32%',
            width: '20%',
            backgroundColor: '#06B6D4'
          }
        },
        {
          id: 'competitor-research',
          title: 'Competitor Research',
          duration: '2 days',
          status: 80,
          level: 1,
          barStyle: {
            left: '54%',
            width: '12%',
            backgroundColor: '#10B981'
          }
        }
      ]
    },
    {
      id: 'design',
      title: 'Design',
      duration: '10 days',
      status: 25,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'user-experience',
          title: 'User Experience',
          duration: '3 days',
          status: 60,
          level: 1,
          barStyle: {
            left: '68%',
            width: '18%',
            backgroundColor: '#8B5CF6'
          }
        },
        {
          id: 'user-interface',
          title: 'User Interface',
          duration: '6 days',
          status: 40,
          level: 1,
          barStyle: {
            left: '88%',
            width: '12%',
            backgroundColor: '#8B5CF6'
          }
        },
        {
          id: 'icons-pack',
          title: 'Icons Pack',
          duration: '3 days',
          status: 0,
          level: 1
        },
        {
          id: 'style-guide',
          title: 'Style Guide',
          duration: '8 days',
          status: 0,
          level: 1
        }
      ]
    },
    {
      id: 'development',
      title: 'Development',
      duration: '12 days',
      status: 0,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'back-end',
          title: 'Back-End',
          duration: '7 days',
          status: 0,
          level: 1
        },
        {
          id: 'api',
          title: 'API',
          duration: '4 days',
          status: 0,
          level: 1
        },
        {
          id: 'front-end',
          title: 'Front-End',
          duration: '8 days',
          status: 0,
          level: 1
        }
      ]
    },
    {
      id: 'testing',
      title: 'Testing',
      duration: '8 days',
      status: 0,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'user-experience-testing',
          title: 'User Experience Testing',
          duration: '6 days',
          status: 0,
          level: 1
        }
      ]
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

  const flattenTasks = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
    const result: ModernGanttTask[] = [];
    
    for (const task of tasks) {
      if (hideCompleted && task.status === 100) continue;
      
      result.push(task);
      if (task.children && expandedTasks.has(task.id)) {
        result.push(...flattenTasks(task.children));
      }
    }
    
    return result;
  };

  const updateTask = (taskId: string, field: 'title' | 'duration' | 'status', value: string | number) => {
    setTasks(prevTasks => {
      const updateTaskRecursively = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = { ...task, [field]: value };
            // Auto-generate bar style for tasks with duration and status
            if ((field === 'duration' || field === 'status') && updatedTask.level > 0) {
              if (!updatedTask.barStyle && updatedTask.status > 0) {
                updatedTask.barStyle = generateBarStyle(updatedTask.id, updatedTask.status);
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
  };

  const generateBarStyle = (taskId: string, status: number) => {
    // Simple algorithm to generate bar positions based on task ID
    const hash = taskId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const left = Math.abs(hash % 60) + 10;
    const width = Math.max(15, Math.abs(hash % 25) + 10);
    const colors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B'];
    const color = colors[Math.abs(hash) % colors.length];
    
    return {
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor: color
    };
  };

  const startEditing = (taskId: string, field: 'title' | 'duration' | 'status', currentValue: string | number) => {
    setEditingField({ taskId, field });
    setEditingValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editingField) return;
    
    const { taskId, field } = editingField;
    let value: string | number = editingValue;
    
    if (field === 'status') {
      value = Math.max(0, Math.min(100, parseInt(editingValue) || 0));
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
      duration: '1 day',
      status: 0,
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
  };

  const getStatusColor = (status: number): string => {
    if (status === 100) return 'text-emerald-600';
    if (status > 50) return 'text-blue-600';
    if (status > 0) return 'text-amber-600';
    return 'text-slate-500';
  };

  const generateTimelineHeaders = () => {
    const months = ['Nov 2024', 'Dec 2024'];
    const days = Array.from({ length: 20 }, (_, i) => 21 + i);
    
    return { months, days };
  };

  const { months, days } = generateTimelineHeaders();
  const flatTasks = flattenTasks(tasks);

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

        {/* Gantt Chart */}
        <div className="flex-1 flex">
          {/* Left Panel - Task List */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            {/* Column Headers */}
            <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4">
              <div className="flex-1 text-sm font-medium text-slate-700">Title</div>
              <div className="w-20 text-sm font-medium text-slate-700 text-center">Duration</div>
              <div className="w-16 text-sm font-medium text-slate-700 text-center">Status</div>
            </div>

            {/* Task Rows */}
            <div className="flex-1 overflow-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="task-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {flatTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`h-12 border-b border-slate-100 flex items-center px-4 hover:bg-slate-50 group ${
                                snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                              }`}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mr-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>

                              <div className="flex-1 flex items-center">
                                <div style={{ marginLeft: `${task.level * 16}px` }} className="flex items-center">
                                  {task.children && task.children.length > 0 && (
                                    <button
                                      onClick={() => toggleExpanded(task.id)}
                                      className="mr-2 p-1 hover:bg-slate-200 rounded transition-colors"
                                    >
                                      {expandedTasks.has(task.id) ? (
                                        <ChevronDown className="w-3 h-3 text-slate-600" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 text-slate-600" />
                                      )}
                                    </button>
                                  )}
                                  
                                  {/* Editable Title */}
                                  {editingField?.taskId === task.id && editingField?.field === 'title' ? (
                                    <input
                                      type="text"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      onBlur={saveEdit}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                      }}
                                      className="text-sm border border-blue-300 rounded px-1 py-0.5 bg-white"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className={`text-sm cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded ${
                                        task.level === 0 ? 'font-medium text-slate-900' : 'text-slate-700'
                                      }`}
                                      onClick={() => startEditing(task.id, 'title', task.title)}
                                    >
                                      {task.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Editable Duration */}
                              <div className="w-20 text-center">
                                {editingField?.taskId === task.id && editingField?.field === 'duration' ? (
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEdit();
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                    className="w-16 text-sm border border-blue-300 rounded px-1 py-0.5 text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className="text-sm text-slate-600 cursor-pointer hover:bg-slate-200 px-1 py-0.5 rounded"
                                    onClick={() => startEditing(task.id, 'duration', task.duration)}
                                  >
                                    {task.duration}
                                  </span>
                                )}
                              </div>
                              
                              {/* Editable Status */}
                              <div className="w-16 text-center">
                                {editingField?.taskId === task.id && editingField?.field === 'status' ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEdit();
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                    className="w-12 px-1 py-0.5 text-xs border border-blue-300 rounded text-center"
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className={`text-sm font-medium cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded ${getStatusColor(task.status)}`}
                                    onClick={() => startEditing(task.id, 'status', task.status)}
                                  >
                                    {task.status}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="flex-1 bg-white">
            {/* Timeline Header */}
            <div className="h-12 bg-slate-50 border-b border-slate-200">
              <div className="flex h-full">
                {months.map((month, i) => (
                  <div key={month} className="flex-1 border-r border-slate-200 last:border-r-0">
                    <div className="h-6 flex items-center justify-center text-sm font-medium text-slate-900 border-b border-slate-200">
                      {month}
                    </div>
                    <div className="h-6 flex">
                      {days.slice(i * 10, (i + 1) * 10).map(day => (
                        <div key={day} className="flex-1 flex items-center justify-center text-xs text-slate-500 border-r border-slate-100 last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Grid and Bars */}
            <div className="relative">
              {flatTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="h-12 border-b border-slate-100 relative group hover:bg-slate-50"
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-slate-100 last:border-r-0"></div>
                    ))}
                  </div>

                  {/* Task Bar */}
                  {task.barStyle && (
                    <div className="absolute inset-0 flex items-center px-1">
                      <div
                        className="h-6 rounded-lg flex items-center px-2 shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden"
                        style={{
                          left: task.barStyle.left,
                          width: task.barStyle.width,
                          backgroundColor: task.barStyle.backgroundColor,
                        }}
                      >
                        {/* Progress Fill */}
                        <div
                          className="absolute inset-0 bg-white/20 rounded-lg"
                          style={{ width: `${task.status}%` }}
                        ></div>
                        
                        <span className="text-xs text-white font-medium relative z-10 truncate">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Milestone or no bar tasks */}
                  {!task.barStyle && task.status > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-6 text-sm text-slate-600">
          <div className="flex items-center space-x-4">
            <span>{flatTasks.length} tasks</span>
            <span>•</span>
            <span>{flatTasks.filter(t => t.status === 100).length} completed</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Overall Progress:</span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.round(flatTasks.reduce((sum, task) => sum + task.status, 0) / flatTasks.length)}%` 
                }}
              ></div>
            </div>
            <span className="font-medium">
              {Math.round(flatTasks.reduce((sum, task) => sum + task.status, 0) / flatTasks.length)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};