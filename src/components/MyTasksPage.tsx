import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { taskService } from './tasks/taskService';
import { Task } from './tasks/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { MyTasksHeader } from './my-tasks/MyTasksHeader';
import { MyTasksGridView } from './my-tasks/MyTasksGridView';
import { MyTasksTableView } from './my-tasks/MyTasksTableView';
import { MyTasksLoadingState } from './my-tasks/MyTasksLoadingState';
import { MyTasksEmptyState } from './my-tasks/MyTasksEmptyState';
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

  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!userProfile.firstName && !userProfile.lastName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all tasks from all projects and filter by assigned user
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

        // Map database fields to component interface
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
        console.error('Error fetching my tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load your tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
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
    setSelectedTask(task);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
    return <MyTasksLoadingState />;
  }

  return (
    <div className="fixed inset-0 bg-white z-40 overflow-auto">
      <div className="min-h-full bg-white">
        <div className="relative z-10 p-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-2 text-foreground hover:text-primary"
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

          {/* Two Column Layout */}
          <div className="mt-2 flex gap-6">
            {/* Left Column - Tasks Content */}
            <div className="flex-1">
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
            <div className="w-80">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                          {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00'}
                        </div>
                        <span className="font-medium text-gray-800 truncate">{task.taskName}</span>
                        <div className="flex gap-2 ml-auto">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-100 text-red-600' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No tasks scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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