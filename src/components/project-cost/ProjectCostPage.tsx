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
    <div className="min-h-screen bg-white">
      {/* Header - Clean and Simple */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">Cost breakdown and tracking</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{tasks.length} items</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              + Add or Import
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Project Budget</div>
            <div className="text-xl font-semibold text-gray-900">${costSummary.totalBudgeted.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Cost Committed</div>
            <div className="text-xl font-semibold text-gray-900">${costSummary.totalActual.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Paid to Date</div>
            <div className="text-xl font-semibold text-gray-900">$0.00</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Variance</div>
            <div className={`text-xl font-semibold ${costSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(costSummary.variance).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1">
        <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
      </div>
    </div>
  );
};