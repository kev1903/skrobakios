import React, { useState, useEffect } from 'react';
import { GanttChart, GanttTask, GanttMilestone } from './GanttChart';
import { ModernGanttChart, ModernGanttTask } from './ModernGanttChart';
import { ProfessionalGanttChart } from './ProfessionalGanttChart';
import { TaskHierarchy } from './TaskHierarchy';
import { TimelineControls } from './TimelineControls';
import { MilestoneManager } from './MilestoneManager';
import { ApiIntegration } from './ApiIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, List, Settings, Zap, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { useUser } from '@/contexts/UserContext';
import { useScreenSize } from '@/hooks/use-mobile';
import { format, addDays, parseISO } from 'date-fns';
import { CentralTask } from '@/services/centralTaskService';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface TimelineViewProps {
  projectId: string;
  projectName: string;
  companyId?: string;
}

export const TimelineView = ({ projectId, projectName, companyId }: TimelineViewProps) => {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [modernGanttTasks, setModernGanttTasks] = useState<ModernGanttTask[]>([]);
  const [milestones, setMilestones] = useState<GanttMilestone[]>([]);
  const [viewMode, setViewMode] = useState<'gantt' | 'hierarchy'>('gantt');
  const [showControls, setShowControls] = useState(false);
  const [apiConnections, setApiConnections] = useState({
    n8n: { connected: false, webhook: '' },
    skai: { connected: false, webhook: '' }
  });
  
  const { toast } = useToast();
  const { userProfile } = useUser();
  const screenSize = useScreenSize();
  
  // Use centralized tasks hook  
  const {
    tasks: centralTasks,
    loading,
    updateTask,
    createTask,
    deleteTask
  } = useCentralTasks(projectId, companyId || 'default-company-id');

  useEffect(() => {
    convertTasksToGanttFormat();
  }, [centralTasks]);

  const convertTasksToGanttFormat = () => {
    try {
      // Group central tasks by stage and create hierarchy
      const stageMap = new Map();
      const ganttTasks: GanttTask[] = [];
      const modernTasks: ModernGanttTask[] = [];
      
      // First, collect all unique stages from activities
      centralTasks.forEach(task => {
        if (task.stage && !stageMap.has(task.stage)) {
          const stageData = {
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
          };
          stageMap.set(task.stage, stageData);
        }
      });

      // Add all stage headers as parent tasks
      stageMap.forEach(stage => ganttTasks.push(stage));

      // Then add all activities as children of their respective stages
      centralTasks.forEach(task => {
        const stageParentId = `stage-${task.stage?.replace(/\s+/g, '-').toLowerCase()}`;
        
        const ganttTask = {
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
          parentId: stageParentId,
          level: 1,
          expanded: task.is_expanded !== false,
          isStage: false
        };

        ganttTasks.push(ganttTask);

        // Create modern gantt task
        const duration = task.start_date && task.end_date 
          ? `${Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
          : '1 day';

        const modernTask: ModernGanttTask = {
          id: task.id,
          name: task.name,
          startDate: task.start_date ? new Date(task.start_date) : new Date(),
          endDate: task.end_date ? new Date(task.end_date) : addDays(new Date(), 1),
          progress: task.progress || 0,
          status: mapTaskStatus(task.stage),
          assignee: task.assigned_to || '',
          duration: duration,
          category: task.stage,
          parentId: stageParentId,
          isStage: false
        };

        modernTasks.push(modernTask);
      });

      // Add stages to modern tasks too
      stageMap.forEach(stage => {
        const duration = '30 days';
        const modernStage: ModernGanttTask = {
          id: stage.id,
          name: stage.name,
          startDate: stage.startDate,
          endDate: stage.endDate,
          progress: stage.progress,
          status: stage.status,
          assignee: '',
          duration: duration,
          category: stage.category,
          isStage: true
        };
        modernTasks.push(modernStage);
      });

      setGanttTasks(ganttTasks);
      setModernGanttTasks(modernTasks);

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

  const handleModernTaskUpdate = async (taskId: string, updates: Partial<ModernGanttTask>) => {
    const ganttUpdates: Partial<GanttTask> = {
      name: updates.name,
      startDate: updates.startDate,
      endDate: updates.endDate,
      progress: updates.progress,
      status: updates.status,
      assignee: updates.assignee
    };
    
    await handleTaskUpdate(taskId, ganttUpdates);
  };

  const handleTaskAdd = async (newTask: Omit<GanttTask, 'id'>, parentId?: string) => {
    try {
      let level = 0;
      let parent_id = null;
      
      if (parentId) {
        const parentTask = ganttTasks.find(t => t.id === parentId);
        if (parentTask) {
          level = (parentTask.level || 0) + 1;
          parent_id = parentId;
        }
      }

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

  const handleModernTaskAdd = async (newTask: Omit<ModernGanttTask, 'id'>) => {
    const ganttTask: Omit<GanttTask, 'id'> = {
      name: newTask.name,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      progress: newTask.progress,
      status: newTask.status,
      assignee: newTask.assignee || '',
      priority: 'Medium',
      description: '',
      category: newTask.category,
      parentId: newTask.parentId,
      level: 1,
      expanded: true,
      isStage: newTask.isStage || false,
      milestone: false
    };
    
    await handleTaskAdd(ganttTask, newTask.parentId);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
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
      const reorderedTasks = taskIds.map(id => ganttTasks.find(task => task.id === id)!).filter(Boolean);
      setGanttTasks(reorderedTasks);
      
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

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks, overallProgress };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (screenSize === 'mobile') {
    return (
      <div className="space-y-4">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-4">
          <div>
            <h2 className="text-xl font-bold">{projectName} Timeline</h2>
            <p className="text-sm text-muted-foreground">Project schedule and milestone tracking</p>
          </div>
          
          {/* Mobile Controls */}
          <div className="flex flex-col space-y-3">
            <Sheet open={showControls} onOpenChange={setShowControls}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Controls
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <div className="space-y-4 pt-6">
                  <Tabs defaultValue="view" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="view">View</TabsTrigger>
                      <TabsTrigger value="milestones">Milestones</TabsTrigger>
                      <TabsTrigger value="api">API</TabsTrigger>
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
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-1">
              <Button
                variant={viewMode === 'gantt' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('gantt')}
                className="flex-1 text-white hover:bg-white/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gantt
              </Button>
              <Button
                variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('hierarchy')}
                className="flex-1 text-white hover:bg-white/20"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Timeline Content */}
        <Card>
          <CardContent className="p-2">
            {viewMode === 'gantt' ? (
              <div className="overflow-x-auto">
                <ProfessionalGanttChart
                  tasks={centralTasks}
                  onTaskUpdate={async (taskId: string, updates: Partial<CentralTask>) => {
                    try {
                      await updateTask(taskId, updates);
                      toast({
                        title: "Task Updated",
                        description: "Task has been successfully updated"
                      });
                    } catch (error) {
                      console.error('Error updating task:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update task",
                        variant: "destructive"
                      });
                    }
                  }}
                  projectTitle={projectName}
                />
              </div>
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">API Integrations:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {apiConnections.n8n.connected && (
                    <Badge variant="secondary">n8n Connected</Badge>
                  )}
                  {apiConnections.skai.connected && (
                    <Badge variant="secondary">Skai Connected</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (screenSize === 'tablet') {
    return (
      <div className="space-y-5">
        {/* Tablet Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{projectName} Timeline</h2>
            <p className="text-muted-foreground">Project schedule and milestone tracking</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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

        {/* Tablet Controls Panel */}
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
                <TabsList className="grid w-full grid-cols-3">
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

        {/* Tablet Timeline Content */}
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              {viewMode === 'gantt' ? (
                <ProfessionalGanttChart
                  tasks={centralTasks}
                  onTaskUpdate={async (taskId: string, updates: Partial<CentralTask>) => {
                    try {
                      await updateTask(taskId, updates);
                      toast({
                        title: "Task Updated",
                        description: "Task has been successfully updated"
                      });
                    } catch (error) {
                      console.error('Error updating task:', error);
                      toast({
                        title: "Error",
                        description: "Failed to update task",
                        variant: "destructive"
                      });
                    }
                  }}
                  projectTitle={projectName}
                />
              ) : (
                <TaskHierarchy
                  tasks={ganttTasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskAdd={handleTaskAdd}
                  onTaskDelete={handleTaskDelete}
                />
              )}
            </div>
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
            <ProfessionalGanttChart
              tasks={centralTasks}
              onTaskUpdate={async (taskId: string, updates: Partial<CentralTask>) => {
                try {
                  await updateTask(taskId, updates);
                  toast({
                    title: "Task Updated",
                    description: "Task has been successfully updated"
                  });
                } catch (error) {
                  console.error('Error updating task:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update task",
                    variant: "destructive"
                  });
                }
              }}
              projectTitle={projectName}
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
