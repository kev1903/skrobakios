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

interface ProjectCostPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectCostPage = ({ project, onNavigate }: ProjectCostPageProps) => {
  const { userProfile } = useUser();
  // Get company ID from user's company membership
  const [companyId, setCompanyId] = useState('');
  const [companyIdLoading, setCompanyIdLoading] = useState(true);
  
  React.useEffect(() => {
    const getCompanyId = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching company ID:', error);
      } finally {
        setCompanyIdLoading(false);
      }
    };
    
    getCompanyId();
  }, []);
  
  const {
    tasks,
    loading,
    updateTask,
    getCostSummary
  } = useCentralTasks(project.id, companyId || '');

  const [activeTab, setActiveTab] = useState('overview');
  
  const costSummary = getCostSummary();
  const tasksByStage = tasks.reduce((acc, task) => {
    if (!acc[task.stage]) acc[task.stage] = [];
    acc[task.stage].push(task);
    return acc;
  }, {} as { [stage: string]: any[] });

  if (companyIdLoading) {
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
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="cost"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          {/* Cost Management Header */}
          <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Cost Management</h1>
                <p className="text-muted-foreground">
                  Track project costs, budgets, and expenses for {project.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Project ID</div>
                <div className="text-lg font-mono text-foreground">#{project.project_id}</div>
              </div>
            </div>
          </div>

          {/* Summary Cards - Compact */}
          <div className="mb-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg border border-white/20 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Project Budget</div>
                <div className="text-xl font-semibold text-foreground">${costSummary.totalBudgeted.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 rounded-lg border border-white/20 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Cost Committed</div>
                <div className="text-xl font-semibold text-foreground">${costSummary.totalActual.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 rounded-lg border border-white/20 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Paid to Date</div>
                <div className="text-xl font-semibold text-foreground">$0.00</div>
              </div>
              <div className="bg-white/10 rounded-lg border border-white/20 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Variance</div>
                <div className={`text-xl font-semibold ${costSummary.variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(costSummary.variance).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Cost Table Content */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl">
            <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
          </div>
        </div>
      </div>
    </div>
  );
};