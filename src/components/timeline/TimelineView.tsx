import React, { useState, useEffect } from 'react';
import { GanttChart, GanttTask, GanttMilestone } from './GanttChart';
import { TaskHierarchy } from './TaskHierarchy';
import { TimelineControls } from './TimelineControls';
import { MilestoneManager } from './MilestoneManager';
import { ApiIntegration } from './ApiIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, List, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO } from 'date-fns';

interface TimelineViewProps {
  projectId: string;
  projectName: string;
}

export const TimelineView = ({ projectId, projectName }: TimelineViewProps) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<GanttMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'gantt' | 'hierarchy'>('gantt');
  const [showControls, setShowControls] = useState(false);
  const [apiConnections, setApiConnections] = useState({
    n8n: { connected: false, webhook: '' },
    skai: { connected: false, webhook: '' }
  });
  
  const { toast } = useToast();

  // Load data from database
  useEffect(() => {
    loadTimelineData();
  }, [projectId]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      // Load tasks from the tasks table
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Convert database tasks to GanttTask format
      const ganttTasks: GanttTask[] = (tasksData || []).map(task => ({
        id: task.id,
        name: task.task_name,
        startDate: task.due_date ? new Date(task.due_date) : new Date(),
        endDate: task.due_date ? addDays(new Date(task.due_date), task.estimated_duration || 1) : addDays(new Date(), 1),
        progress: task.progress || 0,
        status: mapTaskStatus(task.status),
        assignee: task.assigned_to_name || '',
        priority: task.priority as 'High' | 'Medium' | 'Low' || 'Medium',
        description: task.description,
        milestone: task.is_milestone || false,
        category: task.category,
      }));

      setTasks(ganttTasks);

      // Load milestones (tasks marked as milestones)
      const milestoneData: GanttMilestone[] = ganttTasks
        .filter(task => task.milestone)
        .map(task => ({
          id: `milestone-${task.id}`,
          name: task.name,
          date: task.endDate,
          status: task.status === 'completed' ? 'completed' : 
                 task.endDate < new Date() ? 'overdue' : 'upcoming',
          description: task.description
        }));

      setMilestones(milestoneData);

    } catch (error) {
      console.error('Error loading timeline data:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mapTaskStatus = (status: string): 'pending' | 'in-progress' | 'completed' | 'delayed' => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'completed';
      case 'in progress': return 'in-progress';
      case 'pending': return 'pending';
      case 'not started': return 'pending';
      default: return 'pending';
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      // Update local state immediately
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      // Prepare database update
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.task_name = updates.name;
      if (updates.startDate) dbUpdates.due_date = updates.startDate.toISOString().split('T')[0];
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.assignee) dbUpdates.assigned_to_name = updates.assignee;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.description) dbUpdates.description = updates.description;

      // Calculate estimated duration if dates changed
      if (updates.startDate && updates.endDate) {
        const duration = Math.ceil((updates.endDate.getTime() - updates.startDate.getTime()) / (1000 * 60 * 60 * 24));
        dbUpdates.estimated_duration = duration;
      }

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) throw error;

      // Trigger API webhooks for external integrations
      await triggerApiUpdate('task_updated', { taskId, updates });

      toast({
        title: "Task Updated",
        description: "Task has been successfully updated"
      });

    } catch (error) {
      console.error('Error updating task:', error);
      // Revert local state on error
      loadTimelineData();
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const handleTaskAdd = async (newTask: Omit<GanttTask, 'id'>) => {
    try {
      const duration = Math.ceil((newTask.endDate.getTime() - newTask.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          project_id: projectId,
          task_name: newTask.name,
          due_date: newTask.startDate.toISOString().split('T')[0],
          estimated_duration: duration,
          progress: newTask.progress,
          status: newTask.status,
          assigned_to_name: newTask.assignee,
          priority: newTask.priority,
          description: newTask.description,
          is_milestone: newTask.milestone || false,
          category: newTask.category
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const ganttTask: GanttTask = {
        id: data.id,
        ...newTask
      };
      
      setTasks(prev => [...prev, ganttTask]);

      // Trigger API webhook
      await triggerApiUpdate('task_created', { task: ganttTask });

      toast({
        title: "Task Added",
        description: "New task has been successfully created"
      });

    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      // Trigger API webhook
      await triggerApiUpdate('task_deleted', { taskId });

      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted"
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const triggerApiUpdate = async (action: string, data: any) => {
    const promises = [];

    // Trigger n8n webhook if connected
    if (apiConnections.n8n.connected && apiConnections.n8n.webhook) {
      promises.push(
        fetch(apiConnections.n8n.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            projectId,
            projectName,
            timestamp: new Date().toISOString(),
            data
          }),
          mode: 'no-cors'
        }).catch(console.error)
      );
    }

    // Trigger Skai webhook if connected
    if (apiConnections.skai.connected && apiConnections.skai.webhook) {
      promises.push(
        fetch(apiConnections.skai.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            projectId,
            projectName,
            timestamp: new Date().toISOString(),
            data
          }),
          mode: 'no-cors'
        }).catch(console.error)
      );
    }

    await Promise.all(promises);
  };

  const getProjectStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = tasks.filter(t => t.endDate < new Date() && t.status !== 'completed').length;
    
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      overallProgress
    };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with project stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{projectName} Timeline</h2>
            <p className="text-muted-foreground">Project schedule and milestone tracking</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Controls
            </Button>
            
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('gantt')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Gantt
            </Button>
            
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
            >
              <List className="w-4 h-4 mr-2" />
              Hierarchy
            </Button>
          </div>
        </div>

        {/* Project Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.overallProgress}%</div>
              <div className="text-xs text-muted-foreground">Overall Progress</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Timeline Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view" className="w-full">
              <TabsList>
                <TabsTrigger value="view">View Settings</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="api">API Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="view">
                <TimelineControls />
              </TabsContent>
              
              <TabsContent value="milestones">
                <MilestoneManager 
                  milestones={milestones}
                  onMilestoneUpdate={setMilestones}
                  projectId={projectId}
                />
              </TabsContent>
              
              <TabsContent value="api">
                <ApiIntegration 
                  connections={apiConnections}
                  onConnectionUpdate={setApiConnections}
                  onTestConnection={triggerApiUpdate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Main Timeline View */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'gantt' ? (
            <GanttChart
              tasks={tasks}
              milestones={milestones}
              onTaskUpdate={handleTaskUpdate}
              onTaskAdd={handleTaskAdd}
              onTaskDelete={handleTaskDelete}
              editable={true}
              showGrid={true}
              showToday={true}
            />
          ) : (
            <TaskHierarchy
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskAdd={handleTaskAdd}
              onTaskDelete={handleTaskDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      {(apiConnections.n8n.connected || apiConnections.skai.connected) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">API Integrations Active:</span>
              {apiConnections.n8n.connected && (
                <Badge variant="secondary">n8n Connected</Badge>
              )}
              {apiConnections.skai.connected && (
                <Badge variant="secondary">Skai Connected</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};