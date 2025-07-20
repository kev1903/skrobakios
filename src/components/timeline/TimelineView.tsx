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
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { useUser } from '@/contexts/UserContext';
import { format, addDays, parseISO } from 'date-fns';

interface TimelineViewProps {
  projectId: string;
  projectName: string;
  companyId?: string;
}

export const TimelineView = ({ projectId, projectName, companyId }: TimelineViewProps) => {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<GanttMilestone[]>([]);
  const [viewMode, setViewMode] = useState<'gantt' | 'hierarchy'>('gantt');
  const [showControls, setShowControls] = useState(false);
  const [apiConnections, setApiConnections] = useState({
    n8n: { connected: false, webhook: '' },
    skai: { connected: false, webhook: '' }
  });
  
  const { toast } = useToast();
  const { userProfile } = useUser();
  
  // Use centralized tasks hook  
  const {
    tasks: centralTasks,
    loading,
    updateTask,
    createTask,
    deleteTask
  } = useCentralTasks(projectId, companyId || 'default-company-id');

  // Convert central tasks to gantt format
  useEffect(() => {
    convertTasksToGanttFormat();
  }, [centralTasks]);

  const convertTasksToGanttFormat = () => {
    try {
      // Group central tasks by stage and create hierarchy
      const stageMap = new Map();
      const ganttTasks: GanttTask[] = [];
      
      // First, collect all unique stages from activities
      centralTasks.forEach(task => {
        if (task.stage && !stageMap.has(task.stage)) {
          stageMap.set(task.stage, {
            id: `stage-${task.stage.replace(/\s+/g, '-').toLowerCase()}`,
            name: task.stage,
            startDate: new Date(),
            endDate: addDays(new Date(), 30),
            progress: 0,
            status: 'pending' as const,
            assignee: '',
            priority: 'High' as const,
            description: `Project stage: ${task.stage}`,
            milestone: false,
            category: task.stage,
            parentId: undefined,
            level: 0,
            expanded: true,
            isStage: true
          });
        }
      });

      // Add all stage headers as parent tasks
      stageMap.forEach(stage => ganttTasks.push(stage));

      // Then add all activities as children of their respective stages
      centralTasks.forEach(task => {
        const stageParentId = `stage-${task.stage?.replace(/\s+/g, '-').toLowerCase()}`;
        
        ganttTasks.push({
          id: task.id,
          name: task.name,
          startDate: task.start_date ? new Date(task.start_date) : new Date(),
          endDate: task.end_date ? new Date(task.end_date) : addDays(new Date(), 1),
          progress: task.progress || 0,
          status: mapTaskStatus(task.stage),
          assignee: task.assigned_to || '',
          priority: (task.priority as any) || 'Medium',
          description: task.description,
          milestone: false,
          category: task.stage,
          parentId: stageParentId, // All activities are children of their stage
          level: 1, // All activities are level 1 (children of stages)
          expanded: task.is_expanded !== false,
          isStage: false
        });
      });

      setGanttTasks(ganttTasks);

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
      console.error('Error converting tasks to gantt format:', error);
      toast({
        title: "Error",
        description: "Failed to process timeline data",
        variant: "destructive"
      });
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
      setGanttTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      // Check if this is a stage (starts with "stage-") - these are UI constructs only
      if (taskId.startsWith('stage-')) {
        // For stages, we only update local state and don't sync to database
        // since stages are generated from activities, not stored separately
        return;
      }

      // Use centralized task update
      const taskUpdates: any = {};
      if (updates.name) taskUpdates.name = updates.name;
      if (updates.startDate) taskUpdates.start_date = updates.startDate.toISOString();
      if (updates.endDate) taskUpdates.end_date = updates.endDate.toISOString();
      if (updates.description) taskUpdates.description = updates.description;
      if (updates.expanded !== undefined) taskUpdates.is_expanded = updates.expanded;
      if (updates.progress !== undefined) taskUpdates.progress = updates.progress;

      await updateTask(taskId, taskUpdates);

      // Trigger API webhooks for external integrations
      await triggerApiUpdate('activity_updated', { activityId: taskId, updates });

    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive"
      });
    }
  };

  const handleTaskAdd = async (newTask: Omit<GanttTask, 'id'>, parentId?: string) => {
    try {
      // Determine level and parent based on parentId
      let level = 0;
      let parent_id = null;
      
      if (parentId) {
        const parentTask = ganttTasks.find(t => t.id === parentId);
        if (parentTask) {
          level = (parentTask.level || 0) + 1;
          parent_id = parentId;
        }
      }

      // Use centralized task creation
      await createTask({
        name: newTask.name,
        start_date: newTask.startDate.toISOString(),
        end_date: newTask.endDate.toISOString(),
        stage: newTask.category || '4.0 PRELIMINARY',
        description: newTask.description,
        parent_id: parent_id,
        level: level,
        is_expanded: true,
        progress: newTask.progress
      });

      // Trigger API webhook
      await triggerApiUpdate('activity_created', { activity: newTask });

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
      // Use centralized task deletion
      await deleteTask(taskId);

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
      const reorderedTasks = taskIds.map(id => ganttTasks.find(task => task.id === id)!).filter(Boolean);
      setGanttTasks(reorderedTasks);

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
    const totalTasks = ganttTasks.length;
    const completedTasks = ganttTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = ganttTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = ganttTasks.filter(t => t.endDate < new Date() && t.status !== 'completed').length;
    
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
      {/* Header with view controls */}
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
          
          <div className="flex items-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg">
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('gantt')}
              className="text-white hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Gantt
            </Button>
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
              className="text-white hover:bg-white/20"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
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
              tasks={ganttTasks}
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
              tasks={ganttTasks}
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