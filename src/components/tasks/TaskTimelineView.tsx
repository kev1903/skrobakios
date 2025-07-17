
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, CheckCircle, AlertTriangle, Zap, User, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimelineTask } from './types';

interface DatabaseTask {
  id: string;
  task_name: string;
  task_type?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  due_date?: string;
  duration?: number;
  progress?: number;
  progress_percentage?: number;
  description?: string;
  priority?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  project_id?: string;
  created_at?: string;
  dependency_names?: string; // Dependency task names
  dependencies?: any[]; // Raw dependency data
}

export const TaskTimelineView = () => {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiUpdating, setAiUpdating] = useState(false);
  const { toast } = useToast();

  // Get project ID from URL params
  const projectId = new URLSearchParams(window.location.search).get('projectId');

  // Real-time update handler
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Real-time update received:', payload);
    
    if (payload.eventType === 'INSERT') {
      const newTask = transformTaskData(payload.new);
      setTasks(prev => [...prev, newTask]);
      
      toast({
        title: "New Task Added",
        description: `Task "${newTask.task_name}" has been added`,
        action: <Zap className="w-4 h-4" />
      });
    } else if (payload.eventType === 'UPDATE') {
      const updatedTask = transformTaskData(payload.new);
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
      
      toast({
        title: "Task Updated",
        description: `Task "${updatedTask.task_name}" has been updated`,
        action: <Zap className="w-4 h-4" />
      });
    } else if (payload.eventType === 'DELETE') {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
      
      toast({
        title: "Task Deleted",
        description: "A task has been removed from the timeline"
      });
    }
  }, [toast]);

  // Transform task data to common format
  const transformTaskData = useCallback((task: any) => {
    // Handle sk_25008_design table format
    if (task.duration_days !== undefined) {
      return {
        id: task.id,
        task_name: task.task_name,
        task_type: task.task_type,
        status: task.status,
        start_date: task.start_date,
        end_date: task.end_date,
        due_date: task.end_date,
        duration: task.duration_days,
        progress: task.progress_percentage,
        progress_percentage: task.progress_percentage,
        description: task.description,
        priority: 'medium',
        assigned_to_name: 'Project Team',
        project_id: projectId
      };
    }
    
    // Handle general tasks table format
    return {
      ...task,
      project_id: projectId
    };
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    
    // Set up real-time subscriptions
    let sk25008Channel: any = null;
    let tasksChannel: any = null;
    
    if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
      // Subscribe to sk_25008_design table changes
      sk25008Channel = supabase
        .channel(`sk_25008_design_changes_${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sk_25008_design'
          },
          (payload) => {
            console.log('Timeline received SK real-time update:', payload);
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log('SK real-time subscription status:', status);
        });
    } else {
      // Subscribe to general tasks table changes for this project
      tasksChannel = supabase
        .channel(`tasks_changes_${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            console.log('Timeline received tasks real-time update:', payload);
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log('Tasks real-time subscription status:', status);
        });
    }

    return () => {
      if (sk25008Channel) {
        console.log('Removing SK real-time subscription');
        supabase.removeChannel(sk25008Channel);
      }
      if (tasksChannel) {
        console.log('Removing tasks real-time subscription');
        supabase.removeChannel(tasksChannel);
      }
    };
  }, [projectId, handleRealtimeUpdate]);

  // Listen for AI updates via custom events
  useEffect(() => {
    const handleAiUpdate = (event: CustomEvent) => {
      console.log('Timeline received AI update event:', event.detail);
      setAiUpdating(true);
      
      // Force refetch after AI update
      setTimeout(() => {
        console.log('Refetching tasks after AI update...');
        fetchTasks();
        setAiUpdating(false);
      }, 1000); // Wait 1 second then refetch
    };

    window.addEventListener('ai-task-update' as any, handleAiUpdate);
    
    return () => {
      window.removeEventListener('ai-task-update' as any, handleAiUpdate);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from sk_25008_design table first for this specific project
      if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
        const { data: sk25008Tasks, error: sk25008Error } = await supabase
          .from('sk_25008_design')
          .select('*')
          .order('start_date', { ascending: true });

        if (!sk25008Error && sk25008Tasks && sk25008Tasks.length > 0) {
          setTasks(sk25008Tasks.map(task => ({
            id: task.id,
            task_name: task.task_name,
            task_type: task.task_type,
            status: task.status,
            start_date: task.start_date,
            end_date: task.end_date,
            due_date: task.end_date,
            duration: task.duration_days,
            progress: task.progress_percentage,
            progress_percentage: task.progress_percentage,
            description: task.description,
            priority: 'medium', // Default priority
            assigned_to_name: 'Project Team',
            project_id: projectId
          })));
          return;
        }
      }

      // Fallback to general tasks table with dependencies
      const { data: generalTasks, error: generalError } = await supabase
        .from('tasks')
        .select(`
          *,
          dependencies:task_dependencies!successor_task_id(
            id,
            predecessor_task_id,
            dependency_type,
            lag_days,
            predecessor:tasks!predecessor_task_id(task_name)
          )
        `)
        .eq('project_id', projectId || '')
        .order('start_date', { ascending: true });

      if (generalError) throw generalError;

      // Transform tasks to include dependency names
      const transformedTasks = (generalTasks || []).map(task => ({
        ...task,
        dependency_names: task.dependencies?.map((dep: any) => 
          dep.predecessor?.task_name || `Task ${dep.predecessor_task_id}`
        ).join(', ') || undefined
      }));

      setTasks(transformedTasks);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks for timeline view",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "complete":
      case "completed":
        return "bg-green-500";
      case "in-progress":
      case "in progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "not started":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "complete":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
      case "in progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Sort tasks by start date, then by end date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.start_date || a.due_date || a.created_at || '');
    const dateB = new Date(b.start_date || b.due_date || b.created_at || '');
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Task Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found for this project</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Project Timeline</span>
            </div>
            {aiUpdating && (
              <div className="flex items-center space-x-2 text-blue-400 animate-pulse">
                <Zap className="w-4 h-4" />
                <span className="text-sm">SkAi updating...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/20"></div>
            
            <div className="space-y-6">
              {sortedTasks.map((task, index) => (
                <div key={task.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full ${getStatusColor(task.status)} border-4 border-white shadow`}></div>
                  
                  {/* Task card */}
                  <div className="flex-1 min-w-0">
                    <Card className="hover:shadow-md transition-shadow bg-white/5 backdrop-blur-sm border-white/10">
                       <CardContent className="p-4">
                         <div className="space-y-4">
                           {/* Header with activity name and status */}
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <h4 className="font-semibold text-white text-lg">{task.task_name}</h4>
                               {task.description && (
                                 <p className="text-sm text-white/70 mt-1">{task.description}</p>
                               )}
                             </div>
                             <div className="flex flex-col space-y-2">
                               <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                 {task.status}
                               </Badge>
                             </div>
                           </div>
                           
                           {/* Main task details grid */}
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                             {/* Duration */}
                             <div className="flex items-center space-x-2">
                               <Clock className="w-4 h-4 text-white/50" />
                               <div>
                                 <p className="text-white/50 text-xs">Duration</p>
                                 <p className="text-white">{task.duration || 0} days</p>
                               </div>
                             </div>
                             
                             {/* Start Date */}
                             <div className="flex items-center space-x-2">
                               <Calendar className="w-4 h-4 text-white/50" />
                               <div>
                                 <p className="text-white/50 text-xs">Start Date</p>
                                 <p className="text-white">{formatDate(task.start_date)}</p>
                               </div>
                             </div>
                             
                             {/* End Date */}
                             <div className="flex items-center space-x-2">
                               <Calendar className="w-4 h-4 text-white/50" />
                               <div>
                                 <p className="text-white/50 text-xs">End Date</p>
                                 <p className="text-white">{formatDate(task.end_date)}</p>
                               </div>
                             </div>
                             
                             {/* Assignee */}
                             <div className="flex items-center space-x-2">
                               <User className="w-4 h-4 text-white/50" />
                               <div>
                                 <p className="text-white/50 text-xs">Assignee</p>
                                 <p className="text-white truncate">{task.assigned_to_name || 'Unassigned'}</p>
                               </div>
                             </div>
                           </div>
                           
                           {/* Progress and Dependencies */}
                           <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-4">
                               {/* Progress */}
                               <div className="flex items-center space-x-2">
                                 <span className="text-white/50 text-sm">Progress:</span>
                                 <div className="flex items-center space-x-2">
                                   <div className="w-24 bg-white/20 rounded-full h-2">
                                     <div 
                                       className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                                       style={{ width: `${task.progress || task.progress_percentage || 0}%` }}
                                     ></div>
                                   </div>
                                   <span className="text-sm text-white">
                                     {task.progress || task.progress_percentage || 0}%
                                   </span>
                                 </div>
                               </div>
                               
                               {/* Dependencies */}
                               {task.dependency_names && (
                                 <div className="flex items-center space-x-2">
                                   <Link className="w-4 h-4 text-white/50" />
                                   <div>
                                     <span className="text-white/50 text-sm">Depends on:</span>
                                     <p className="text-white text-sm truncate max-w-[200px]" title={task.dependency_names}>
                                       {task.dependency_names}
                                     </p>
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
