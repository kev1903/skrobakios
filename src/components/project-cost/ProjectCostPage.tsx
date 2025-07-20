import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, AlertTriangle } from 'lucide-react';
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { Project } from '@/hooks/useProjects';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { CostSummaryCard } from './CostSummaryCard';
import { CostByStageChart } from './CostByStageChart';
import { TaskCostTable } from './TaskCostTable';
import { CostAnalytics } from './CostAnalytics';

interface ProjectCostPageProps {
  project: Project;
}

export const ProjectCostPage = ({ project }: ProjectCostPageProps) => {
  const { userProfile } = useUser();
  // Get company ID from user's company membership
  const [companyId, setCompanyId] = useState('');
  
  React.useEffect(() => {
    const getCompanyId = async () => {
      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (data?.company_id) {
        setCompanyId(data.company_id);
      }
    };
    
    getCompanyId();
  }, []);
  
  const {
    tasks,
    loading,
    updateTask,
    getCostSummary
  } = useCentralTasks(project.id, companyId);

  const [activeTab, setActiveTab] = useState('overview');
  
  const costSummary = getCostSummary();
  const tasksByStage = tasks.reduce((acc, task) => {
    if (!acc[task.stage]) acc[task.stage] = [];
    acc[task.stage].push(task);
    return acc;
  }, {} as { [stage: string]: any[] });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getVarianceStatus = (variance: number) => {
    if (variance > 0) return { text: 'Under Budget', color: 'text-green-600', icon: TrendingUp };
    if (variance < 0) return { text: 'Over Budget', color: 'text-red-600', icon: TrendingDown };
    return { text: 'On Budget', color: 'text-blue-600', icon: BarChart3 };
  };

  const varianceStatus = getVarianceStatus(costSummary.variance);
  const VarianceIcon = varianceStatus.icon;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name} - Cost Management</h1>
          <p className="text-muted-foreground">Track and manage project costs across all stages</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {tasks.length} Tasks
          </Badge>
          <Badge variant="outline" className="text-sm">
            {Object.keys(tasksByStage).length} Stages
          </Badge>
        </div>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">${costSummary.totalBudgeted.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actual</p>
                <p className="text-2xl font-bold">${costSummary.totalActual.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Variance</p>
                <p className={`text-2xl font-bold ${varianceStatus.color}`}>
                  ${Math.abs(costSummary.variance).toLocaleString()}
                </p>
              </div>
              <VarianceIcon className={`h-8 w-8 ${varianceStatus.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold ${varianceStatus.color}`}>
                  {varianceStatus.text}
                </p>
              </div>
              {costSummary.variance < 0 && (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stages">By Stage</TabsTrigger>
          <TabsTrigger value="tasks">Task Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CostSummaryCard costSummary={costSummary} />
            <CostByStageChart tasksByStage={tasksByStage} />
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(tasksByStage).map(([stage, stageTasks]) => {
              const stageBudgeted = stageTasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0);
              const stageActual = stageTasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0);
              const stageVariance = stageBudgeted - stageActual;
              
              return (
                <Card key={stage}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{stage}</CardTitle>
                      <Badge variant={stageVariance >= 0 ? "default" : "destructive"}>
                        {stageVariance >= 0 ? "Under Budget" : "Over Budget"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budgeted</p>
                        <p className="font-semibold">${stageBudgeted.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actual</p>
                        <p className="font-semibold">${stageActual.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variance</p>
                        <p className={`font-semibold ${stageVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(stageVariance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {stageTasks.length} tasks in this stage
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CostAnalytics tasks={tasks} costSummary={costSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
};