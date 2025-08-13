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
import { ProjectSidebar } from '../ProjectSidebar';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';
import { CostSummaryCard } from './CostSummaryCard';
import { CostByStageChart } from './CostByStageChart';
import { TaskCostTable } from './TaskCostTable';
import { CostAnalytics } from './CostAnalytics';
import { StageManagement } from './StageManagement';
interface ProjectCostPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}
export const ProjectCostPage = ({
  project,
  onNavigate
}: ProjectCostPageProps) => {
  const { userProfile } = useUser();

  // Use the central tasks hook to get real data from the database
  const { 
    tasks, 
    loading, 
    updateTask,
    getCostSummary,
    loadTasks
  } = useCentralTasks(project.id, project.company_id || 'demo-company');
  const costSummary = getCostSummary();
  const getVarianceStatus = (variance: number) => {
    if (variance > 0) return {
      text: 'Under Budget',
      color: 'text-green-600',
      icon: TrendingUp
    };
    if (variance < 0) return {
      text: 'Over Budget',
      color: 'text-red-600',
      icon: TrendingDown
    };
    return {
      text: 'On Budget',
      color: 'text-blue-600',
      icon: BarChart3
    };
  };
  const varianceStatus = getVarianceStatus(costSummary.variance);
  const VarianceIcon = varianceStatus.icon;
  return <div className="h-screen flex bg-background">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-48 z-40">
        <ProjectSidebar project={project} onNavigate={onNavigate} getStatusColor={getStatusColor} getStatusText={getStatusText} activeSection="cost" />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-48 overflow-auto bg-background">
        <div className="p-6">

          {/* Summary Cards - Compact */}
          <div className="mb-3 bg-card border rounded-lg p-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Project Budget</div>
                <div className="text-lg font-semibold text-foreground">${costSummary.totalBudgeted.toLocaleString()}</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Cost Committed</div>
                <div className="text-lg font-semibold text-foreground">${costSummary.totalActual.toLocaleString()}</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Paid to Date</div>
                <div className="text-lg font-semibold text-foreground">$0.00</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Variance</div>
                <div className={`text-lg font-semibold ${costSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(costSummary.variance).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Cost Table Content */}
          <div className="bg-card border rounded-lg">
            {/* Table Header with Stage Management and Finance Button */}
            <div className="bg-muted/30 border-b px-6 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Button
                    onClick={() => onNavigate('project-finance')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Finance Management
                  </Button>
                </div>
                <div>
                  <StageManagement 
                    projectId={project.id}
                    companyId={project.company_id || 'demo-company'}
                    onStageUpdated={loadTasks}
                  />
                </div>
              </div>
            </div>
            <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
          </div>
        </div>
      </div>
    </div>;
};