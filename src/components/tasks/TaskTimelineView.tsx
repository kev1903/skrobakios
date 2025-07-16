
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, CheckCircle, AlertTriangle, Zap, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

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
}

export const TaskTimelineView = () => {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiUpdating, setAiUpdating] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get project ID from URL params
  const projectId = new URLSearchParams(window.location.search).get('projectId');

  // Real-time update handler
  const handleRealtimeUpdate = useCallback((table: string, payload: any) => {
    console.log('Timeline received real-time update:', { table, payload });
    setSyncError(null); // Clear any sync errors
    
    if (payload.eventType === 'INSERT') {
      const newTask = transformTaskData(payload.new);
      setTasks(prev => {
        // Check if task already exists to prevent duplicates
        if (prev.some(t => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    } else if (payload.eventType === 'UPDATE') {
      const updatedTask = transformTaskData(payload.new);
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    } else if (payload.eventType === 'DELETE') {
      setTasks(prev => prev.filter(task => task.id !== payload.old.id));
    }
  }, []);

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

  const fetchTasks = useCallback(async () => {
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

      // Fallback to general tasks table
      const { data: generalTasks, error: generalError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId || '')
        .order('due_date', { ascending: true });

      if (generalError) throw generalError;

      setTasks(generalTasks || []);

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
  }, [projectId, toast]);

  // Determine which tables to sync based on project
  const tablesToSync = projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')
    ? ['sk_25008_design']
    : ['tasks'];

  // Set up real-time sync
  const { syncStatus, forceResync, isConnected, isRetrying } = useRealtimeSync({
    projectId,
    tables: tablesToSync,
    onUpdate: handleRealtimeUpdate,
    retryCount: 5,
    retryDelay: 2000
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen for AI updates via custom events
  useEffect(() => {
    const handleAiUpdate = (event: CustomEvent) => {
      console.log('Timeline received AI update event:', event.detail);
      setAiUpdating(true);
      
      // Brief delay then clear updating state - real-time sync will handle updates
      setTimeout(() => {
        setAiUpdating(false);
      }, 2000);
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('Timeline received force refresh event:', event.detail);
      setAiUpdating(true);
      fetchTasks(); // Force immediate refetch
      setTimeout(() => setAiUpdating(false), 1000);
    };

    window.addEventListener('ai-task-update' as any, handleAiUpdate);
    window.addEventListener('force-timeline-refresh' as any, handleForceRefresh);
    
    return () => {
      window.removeEventListener('ai-task-update' as any, handleAiUpdate);
      window.removeEventListener('force-timeline-refresh' as any, handleForceRefresh);
    };
  }, [fetchTasks]);


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
            <div className="flex items-center space-x-4">
              {/* Sync Status Indicator */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center space-x-1 text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs">Live</span>
                  </div>
                ) : isRetrying ? (
                  <div className="flex items-center space-x-1 text-yellow-400 animate-pulse">
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Reconnecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs cursor-pointer" onClick={forceResync}>
                      Offline (click to retry)
                    </span>
                  </div>
                )}
              </div>
              
              {/* AI Update Indicator */}
              {aiUpdating && (
                <div className="flex items-center space-x-2 text-blue-400 animate-pulse">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">SkAi updating...</span>
                </div>
              )}
            </div>
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
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-white">{task.task_name}</h4>
                              {task.description && (
                                <p className="text-sm text-white/70 mt-1">{task.description}</p>
                              )}
                              {task.task_type && (
                                <p className="text-xs text-white/50 mt-1">Type: {task.task_type}</p>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {task.priority && (
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs bg-white/20 text-white">
                                    {task.assigned_to_name?.split(' ').map(n => n[0]).join('') || 'PT'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-white/70">
                                  {task.assigned_to_name || 'Project Team'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-white/50">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {task.start_date && task.end_date 
                                    ? `${formatDate(task.start_date)} - ${formatDate(task.end_date)}`
                                    : `Due: ${formatDate(task.due_date)}`
                                  }
                                </span>
                              </div>

                              {task.duration && (
                                <div className="flex items-center space-x-1 text-sm text-white/50">
                                  <span>{task.duration} days</span>
                                </div>
                              )}
                            </div>
                            
                            {(task.progress || task.progress_percentage) && (
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-white/20 rounded-full h-2">
                                  <div 
                                    className="bg-blue-400 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${task.progress || task.progress_percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-white/70">
                                  {task.progress || task.progress_percentage}%
                                </span>
                              </div>
                            )}
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
