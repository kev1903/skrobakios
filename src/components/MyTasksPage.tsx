import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { taskService } from './tasks/taskService';
import { Task } from './tasks/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MyTasksHeader } from './my-tasks/MyTasksHeader';
import { MyTasksGridView } from './my-tasks/MyTasksGridView';
import { MyTasksTableView } from './my-tasks/MyTasksTableView';
import { MyTasksLoadingState } from './my-tasks/MyTasksLoadingState';
import { MyTasksEmptyState } from './my-tasks/MyTasksEmptyState';
import { MyTasksCalendarView } from './my-tasks/MyTasksCalendarView';
import { TaskEditSidePanel } from './tasks/TaskEditSidePanel';
import { SortField, SortDirection, ViewMode } from './my-tasks/types';

interface MyTasksPageProps {
  onNavigate: (page: string) => void;
}

export const MyTasksPage = ({ onNavigate }: MyTasksPageProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortField, setSortField] = useState<SortField>('taskName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const { userProfile } = useUser();
  const { toast } = useToast();

  // Function to refresh tasks
  const refreshTasks = async () => {
    if (!userProfile.firstName && !userProfile.lastName) {
      return;
    }

    try {
      const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
      const { data: allTasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name,
            project_id
          )
        `)
        .or(`assigned_to_name.ilike.%${fullName}%,assigned_to_name.ilike.%${userProfile.firstName}%,assigned_to_name.ilike.%${userProfile.lastName}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (allTasks || []).map(task => ({
        id: task.id,
        project_id: task.project_id,
        projectName: task.projects?.name || 'Unknown Project',
        taskName: task.task_name,
        taskType: (task.task_type as 'Task' | 'Issue') || 'Task',
        priority: task.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: task.assigned_to_name || '',
          avatar: task.assigned_to_avatar || ''
        },
        dueDate: task.due_date || '',
        status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: task.progress,
        description: task.description,
        duration: task.estimated_duration,
        is_milestone: task.is_milestone,
        is_critical_path: task.is_critical_path,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  useEffect(() => {
    // Initial load
    const fetchMyTasks = async () => {
      setLoading(true);
      await refreshTasks();
      setLoading(false);
    };

    fetchMyTasks();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('my-tasks-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('MyTasks: Task change detected:', payload);
          // Refetch tasks when any task changes
          refreshTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile, toast]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested values
      if (sortField === 'assignedTo') {
        aValue = a.assignedTo.name;
        bValue = b.assignedTo.name;
      }

      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? 1 : -1;
      if (!bValue) return sortDirection === 'asc' ? -1 : 1;

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to task edit page with task ID
    onNavigate(`task-edit?id=${task.id}`);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('🔄 MyTasksPage: Drag ended:', result);
    
    const { destination, source, draggableId } = result;
    
    // If no destination or dragged to same position, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Extract task ID from draggableId
    const taskId = draggableId.replace('calendar-task-', '').replace('task-', '');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    try {
      // Handle dropping to calendar time slots
      if (destination.droppableId.startsWith('calendar-slot-')) {
        // Extract date and time from droppableId
        // Format: "calendar-slot-YYYY-MM-DD-HH-MM"
        const parts = destination.droppableId.replace('calendar-slot-', '').split('-');
        if (parts.length === 5) {
          const [year, month, day, hour, minute] = parts.map(p => parseInt(p));
          
          // Create new date with the target time
          const newDate = new Date(year, month - 1, day, hour, minute);
          
          // Update the task in the database
          const { error } = await supabase
            .from('tasks')
            .update({ due_date: newDate.toISOString() })
            .eq('id', taskId);

          if (error) throw error;
          
          // Refresh the tasks
          await refreshTasks();
          
          toast({
            title: "Task scheduled",
            description: `"${task.taskName}" scheduled for ${format(newDate, 'MMM dd, HH:mm')}`,
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <MyTasksLoadingState />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="pt-8 pb-6 px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("home")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          <MyTasksHeader
            tasksCount={tasks.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigate={onNavigate}
          />
        </div>

        {/* Content Layout - Full width for calendar, two-column for others */}
        <div className="px-8 pb-8">
          {viewMode === 'calendar' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="min-h-screen">
                {tasks.length === 0 ? (
                  <MyTasksEmptyState onNavigate={onNavigate} />
                ) : (
                  <MyTasksCalendarView
                    tasks={getSortedTasks()}
                    onTaskClick={handleTaskClick}
                    onTaskUpdate={async (taskId, updates) => {
                      try {
                        // Update the task in the database
                        const { error } = await supabase
                          .from('tasks')
                          .update({
                            ...(updates.dueDate && { due_date: updates.dueDate }),
                            ...(updates.taskName && { task_name: updates.taskName }),
                            ...(updates.status && { status: updates.status }),
                            ...(updates.priority && { priority: updates.priority }),
                            ...(updates.progress !== undefined && { progress: updates.progress }),
                          })
                          .eq('id', taskId);

                        if (error) throw error;
                        
                        // Refresh the tasks
                        await refreshTasks();
                      } catch (error) {
                        console.error('Error updating task:', error);
                        throw error;
                      }
                    }}
                  />
                )}
              </div>
            </DragDropContext>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left Column - Tasks Content */}
              <div className="lg:col-span-3">
                {tasks.length === 0 ? (
                  <MyTasksEmptyState onNavigate={onNavigate} />
                ) : viewMode === 'grid' ? (
                  <MyTasksGridView
                    tasks={getSortedTasks()}
                    selectedTasks={selectedTasks}
                    onSelectTask={handleSelectTask}
                    onTaskClick={handleTaskClick}
                  />
                ) : (
                  <MyTasksTableView
                    tasks={getSortedTasks()}
                    selectedTasks={selectedTasks}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onSelectAll={handleSelectAll}
                    onSelectTask={handleSelectTask}
                    onTaskClick={handleTaskClick}
                  />
                )}
              </div>

              {/* Right Column - Today's Schedule */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 font-playfair">Today's Schedule</h3>
                  <div className="space-y-4">
                    {tasks.length > 0 ? (
                      tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-100" onClick={() => handleTaskClick(task)}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium">
                              {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00'}
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              task.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                              task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{task.taskName}</h4>
                            <p className="text-xs text-gray-600">{task.projectName}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100">
                        <p className="text-gray-600">No tasks scheduled for today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        projectId={selectedTask?.project_id}
      />
    </div>
  );
};