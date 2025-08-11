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
  
  // Demo data for testing - direct approach
  const demoTasks = [
    {
      id: '26',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Excavation',
      description: 'Included in Slab Cost',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 0,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '27',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Slab',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 110000,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '28',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Site Clean',
      description: '4 Site Clean',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 6600,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '29',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Set Out',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 400,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '30',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Protection Works',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 1200,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '31',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Planter Boxes',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 3800,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '32',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Pest Control Part A',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 1200,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '33',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Fence Painting',
      description: '',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 800,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '34',
      project_id: project.id,
      company_id: companyId || 'demo',
      name: 'Fence - Rear',
      description: 'At the back',
      stage: '5.1 BASE STAGE',
      level: 0,
      status: 'TO DO',
      budgeted_cost: 500,
      actual_cost: 0,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Use demo data directly instead of the hook
  const tasks = demoTasks;
  const loading = false;

  const updateTask = async (taskId: string, updates: any) => {
    console.log('Update task:', taskId, updates);
  };

  const getCostSummary = () => {
    let totalBudgeted = 0;
    let totalActual = 0;
    const stages: { [stage: string]: { budgeted: number; actual: number } } = {};

    tasks.forEach(task => {
      const budgeted = task.budgeted_cost || 0;
      const actual = task.actual_cost || 0;
      
      totalBudgeted += budgeted;
      totalActual += actual;

      if (!stages[task.stage]) {
        stages[task.stage] = { budgeted: 0, actual: 0 };
      }
      stages[task.stage].budgeted += budgeted;
      stages[task.stage].actual += actual;
    });

    return {
      totalBudgeted,
      totalActual,
      variance: totalBudgeted - totalActual,
      stages
    };
  };

  const costSummary = getCostSummary();

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
    <div className="h-screen flex bg-background">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-48 z-40">
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="cost"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-48 overflow-auto bg-background">
        <div className="p-6">
          {/* Compact Header */}
          <div className="mb-6 bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Cost Management</h1>
                <p className="text-sm text-muted-foreground">
                  Track project costs, budgets, and expenses for {project.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Project ID</div>
                <div className="text-sm font-mono text-foreground">#{project.project_id}</div>
              </div>
            </div>
          </div>

          {/* Summary Cards - Compact */}
          <div className="mb-6 bg-card border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Project Budget</div>
                <div className="text-xl font-semibold text-foreground">${costSummary.totalBudgeted.toLocaleString()}</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Cost Committed</div>
                <div className="text-xl font-semibold text-foreground">${costSummary.totalActual.toLocaleString()}</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Paid to Date</div>
                <div className="text-xl font-semibold text-foreground">$0.00</div>
              </div>
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Variance</div>
                <div className={`text-xl font-semibold ${costSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(costSummary.variance).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Cost Table Content */}
          <div className="bg-card border rounded-lg">
            <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
          </div>
        </div>
      </div>
    </div>
  );
};