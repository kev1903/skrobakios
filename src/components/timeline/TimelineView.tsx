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
      // Load activities from the activities table
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Convert database activities to GanttTask format
      const ganttTasks: GanttTask[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        name: activity.name,
        startDate: activity.start_date ? new Date(activity.start_date) : new Date(),
        endDate: activity.end_date ? new Date(activity.end_date) : addDays(new Date(), 1),
        progress: 0, // Activities don't have progress field, defaulting to 0
        status: mapTaskStatus(activity.stage),
        assignee: '', // Activities don't have assignee field
        priority: 'Medium' as 'High' | 'Medium' | 'Low',
        description: activity.description,
        milestone: false,
        category: activity.stage,
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

      // Prepare database update for activities table
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.startDate) dbUpdates.start_date = updates.startDate.toISOString();
      if (updates.endDate) dbUpdates.end_date = updates.endDate.toISOString();
      if (updates.status) dbUpdates.stage = updates.status;
      if (updates.description) dbUpdates.description = updates.description;

      const { error } = await supabase
        .from('activities')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) throw error;

      // Trigger API webhooks for external integrations
      await triggerApiUpdate('activity_updated', { activityId: taskId, updates });

    } catch (error) {
      console.error('Error updating activity:', error);
      // Revert local state on error
      loadTimelineData();
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive"
      });
    }
  };

  const handleTaskAdd = async (newTask: Omit<GanttTask, 'id'>) => {
    try {
      // Get user's company ID for activities table
      const { data: userData } = await supabase.auth.getUser();
      const { data: companyData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userData.user?.id)
        .eq('status', 'active')
        .single();

      const { data, error } = await supabase
        .from('activities')
        .insert([{
          project_id: projectId,
          company_id: companyData?.company_id,
          name: newTask.name,
          start_date: newTask.startDate.toISOString(),
          end_date: newTask.endDate.toISOString(),
          stage: newTask.status,
          description: newTask.description,
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
      await triggerApiUpdate('activity_created', { activity: ganttTask });

      toast({
        title: "Activity Added",
        description: "New activity has been successfully created"
      });

    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      // Trigger API webhook
      await triggerApiUpdate('activity_deleted', { activityId: taskId });

      toast({
        title: "Activity Deleted", 
        description: "Activity has been successfully deleted"
      });

    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive"
      });
    }
  };

  const handleTaskReorder = async (taskIds: string[]) => {
    try {
      // Update local state immediately
      const reorderedTasks = taskIds.map(id => tasks.find(task => task.id === id)!).filter(Boolean);
      setTasks(reorderedTasks);

      // Note: For now, we'll just update the local state
      // In a real implementation, you might want to persist the order to the database
      // by adding a 'sort_order' column to the tasks table
      
      toast({
        title: "Activities Reordered",
        description: "Activity order has been updated"
      });

    } catch (error) {
      console.error('Error reordering activities:', error);
      toast({
        title: "Error", 
        description: "Failed to reorder activities",
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
              <div className="text-xs text-muted-foreground">Total Activities</div>
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
              onTaskReorder={handleTaskReorder}
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