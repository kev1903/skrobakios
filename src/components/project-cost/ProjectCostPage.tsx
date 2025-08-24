import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, AlertTriangle, ChevronDown, Settings, Upload, Plus } from 'lucide-react';
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { useProjectSettings } from '@/hooks/useProjectSettings';
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

import { ExpensesModule } from '../project-finance/expenses/ExpensesModule';
import { AnalyticsModule } from '../project-finance/analytics/AnalyticsModule';
import { InvoiceDrawer } from '../project-finance/income/InvoiceDrawer';
import { InvoicePDFUploader } from '../project-finance/income/InvoicePDFUploader';
import { AIPromptSettings } from './AIPromptSettings';
import { AwaitingPaymentsTable } from '../project-finance/awaiting-payments/AwaitingPaymentsTable';
import { IncomeTable } from './IncomeTable';
import { ContractsTable } from './ContractsTable';

interface ProjectCostPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectCostPage = ({
  project,
  onNavigate
}: ProjectCostPageProps) => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  
  // Read tab from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'income');
  const [incomeStatusFilter, setIncomeStatusFilter] = useState('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('inbox');
  const [incomeData, setIncomeData] = useState({ totalBilled: 0, totalPaid: 0, outstanding: 0, overdue: 0 });
  const [expenseData, setExpenseData] = useState({ totalBills: 0, totalPaid: 0, outstanding: 0, pending: 0, totalItems: 0 });
  const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
  const [isPDFUploaderOpen, setIsPDFUploaderOpen] = useState(false);
  const [isInvoicePDFUploaderOpen, setIsInvoicePDFUploaderOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tab options configuration
  const tabOptions = [
    { value: 'income', label: 'Income', icon: DollarSign },
    { value: 'expense', label: 'Expense', icon: TrendingDown },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'cost-control', label: 'Cost Control', icon: AlertTriangle }
  ];

  // Get current tab label function
  const getCurrentTabLabel = () => {
    return tabOptions.find(tab => tab.value === activeTab)?.label || 'Cost Control';
  };

  // Get project-specific settings for consistent formatting
  const { settings, formatCurrency, formatDate, loading: settingsLoading } = useProjectSettings(
    project.id, 
    project.company_id
  );

  // Refresh function to reload all data
  const refreshData = () => {
    loadIncomeData();
    loadExpenseData();
    setRefreshTrigger(prev => prev + 1); // Trigger refresh in ExpensesModule
  };

  // Use the central tasks hook to get real data from the database
  const { 
    tasks, 
    loading, 
    updateTask,
    getCostSummary,
    loadTasks
  } = useCentralTasks(project.id, project.company_id || 'demo-company');
  const costSummary = getCostSummary();

  // Load income data
  const loadIncomeData = async () => {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', project.id);
      
      if (invoices) {
        const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_to_date, 0);
        const outstanding = invoices.reduce((sum, inv) => sum + (inv.total - inv.paid_to_date), 0);
        const overdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total - inv.paid_to_date), 0);
        
        setIncomeData({ totalBilled, totalPaid, outstanding, overdue });
      }
    } catch (error) {
      console.error('Error loading income data:', error);
    }
  };

  // Load expense data
  const loadExpenseData = async () => {
    try {
      const { data: bills } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', project.id);
      
      if (bills) {
        const totalBills = bills.reduce((sum, bill) => sum + bill.total, 0);
        const totalPaid = bills.reduce((sum, bill) => sum + bill.paid_to_date, 0);
        const outstanding = bills.reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0);
        const pending = bills.filter(bill => bill.status === 'submitted').length;
        const totalItems = bills.length;
        
        setExpenseData({ totalBills, totalPaid, outstanding, pending, totalItems });
      }
    } catch (error) {
      console.error('Error loading expense data:', error);
    }
  };

  React.useEffect(() => {
    loadIncomeData();
    loadExpenseData();
  }, [project.id]);

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
      <div className="flex-1 ml-48 h-screen overflow-y-auto bg-background">
        <div className="p-6 min-h-full">
          {/* Summary Cards - Dynamic based on active tab */}
          <div className="mb-3 bg-card border rounded-lg p-2">
            <div className="grid grid-cols-4 gap-2">
              {activeTab === 'income' && (
                <>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Billed</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(incomeData.totalBilled)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Paid</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(incomeData.totalPaid)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Outstanding</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(incomeData.outstanding)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Overdue</div>
                    <div className="text-lg font-semibold text-red-600">{formatCurrency(incomeData.overdue)}</div>
                  </div>
                </>
              )}
              {activeTab === 'expense' && (
                <>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Bills</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(expenseData.totalBills)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Total Paid</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(expenseData.totalPaid)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Outstanding</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(expenseData.outstanding)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Pending Approval</div>
                    <div className="text-lg font-semibold text-yellow-600">{expenseData.pending}</div>
                  </div>
                </>
              )}
              {activeTab === 'analytics' && (
                <>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Net Income</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(incomeData.totalPaid - expenseData.totalPaid)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Income vs Budget</div>
                    <div className="text-lg font-semibold text-foreground">{costSummary.totalBudgeted > 0 ? ((incomeData.totalBilled / costSummary.totalBudgeted) * 100).toFixed(1) : 0}%</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Expense Ratio</div>
                    <div className="text-lg font-semibold text-foreground">{incomeData.totalBilled > 0 ? ((expenseData.totalBills / incomeData.totalBilled) * 100).toFixed(1) : 0}%</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Profit Margin</div>
                    <div className="text-lg font-semibold text-green-600">{incomeData.totalBilled > 0 ? (((incomeData.totalBilled - expenseData.totalBills) / incomeData.totalBilled) * 100).toFixed(1) : 0}%</div>
                  </div>
                </>
              )}
              {activeTab === 'cost-control' && (
                <>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Project Budget</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(costSummary.totalBudgeted)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Cost Committed</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(costSummary.totalActual)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Paid to Date</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(0)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Variance</div>
                    <div className={`text-lg font-semibold ${costSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(costSummary.variance))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content with Tabs */}
          <div className="bg-card border rounded-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Header */}
              <div className="bg-muted/30 border-b px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Left side - Tab dropdown and Contract Amount */}
                  <div className="flex items-center gap-6">
                    {/* Tab Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
                        >
                          {getCurrentTabLabel()}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 bg-background border border-border shadow-lg z-50">
                        {tabOptions.map((option) => {
                          const IconComponent = option.icon;
                          return (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => setActiveTab(option.value)}
                              className={`flex items-center gap-2 cursor-pointer ${
                                activeTab === option.value 
                                  ? 'bg-accent text-accent-foreground' 
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Contract Amount Header */}
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-sm text-muted-foreground">Contract Amount:</span>
                        <span className="ml-2 text-lg font-semibold text-foreground">
                          {project.contract_price ? formatCurrency(parseFloat(project.contract_price.replace(/[$,]/g, '') || '0')) : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Status filter and buttons */}
                  <div className="flex items-center gap-4">
                    {activeTab === 'income' && (
                      <>
                        <select
                          value={incomeStatusFilter}
                          onChange={(e) => setIncomeStatusFilter(e.target.value)}
                          className="px-3 py-2 border border-border rounded-md text-sm bg-background"
                        >
                          <option value="all">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="part_paid">Part Paid</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </>
                    )}
                    {activeTab === 'expense' && (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={expenseStatusFilter === 'inbox' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExpenseStatusFilter('inbox')}
                              className="text-sm"
                            >
                              For Approval
                            </Button>
                            <Button
                              variant={expenseStatusFilter === 'scheduled' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExpenseStatusFilter('scheduled')}
                              className="text-sm"
                            >
                              Awaiting Payments
                            </Button>
                            <Button
                              variant={expenseStatusFilter === 'paid' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setExpenseStatusFilter('paid')}
                              className="text-sm"
                            >
                              Paid
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                            {expenseData.totalItems || 0} items | {formatCurrency(expenseData.totalBills || 0)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsPDFUploaderOpen(true)}
                          >
                            <DollarSign className="h-4 w-4" />
                            UPLOAD BILLS
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setIsAISettingsOpen(true)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                    {activeTab === 'cost-control' && (
                      <StageManagement 
                        projectId={project.id}
                        companyId={project.company_id || 'demo-company'}
                        onStageUpdated={loadTasks}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <TabsContent value="income" className="mt-0">
                  <div className="space-y-6">
                    {/* Income Actions */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Project Income</h3>
                        <p className="text-muted-foreground">Manage invoices and track revenue</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setIsInvoicePDFUploaderOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Contract
                        </Button>
                        <Button 
                          onClick={() => navigate(`/invoice/create?projectId=${project.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Invoice
                        </Button>
                      </div>
                    </div>
                     
                     {/* Contracts and Invoices Hierarchy */}
                     <ContractsTable
                       projectId={project.id}
                       formatCurrency={formatCurrency}
                       formatDate={formatDate}
                     />

                     {/* Note: Invoices are now shown under their parent contracts above */}
                  </div>
                </TabsContent>

                <TabsContent value="expense" className="mt-0">
                  {expenseStatusFilter === 'inbox' ? (
                    <ExpensesModule 
                      projectId={project.id}
                      statusFilter={expenseStatusFilter}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      onDataUpdate={setExpenseData}
                      refreshTrigger={refreshTrigger}
                    />
                  ) : expenseStatusFilter === 'scheduled' ? (
                    <AwaitingPaymentsTable 
                      projectId={project.id}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ) : expenseStatusFilter === 'paid' ? (
                    // Paid Table
                    <div className="space-y-4">
                      <div className="text-center py-8 text-foreground">
                        <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
                          <DollarSign className="h-8 w-8" />
                        </div>
                        <p className="text-foreground">No paid invoices.</p>
                        <p className="text-sm mt-2 text-muted-foreground">Completed payments will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    <ExpensesModule 
                      projectId={project.id}
                      statusFilter={expenseStatusFilter}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      onDataUpdate={setExpenseData}
                      refreshTrigger={refreshTrigger}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-0">
                  <AnalyticsModule 
                    projectId={project.id} 
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                </TabsContent>
                
                <TabsContent value="cost-control" className="mt-0">
                  <TaskCostTable tasks={tasks} onUpdateTask={updateTask} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* PDF Invoice Uploader */}
      <InvoicePDFUploader
        isOpen={isPDFUploaderOpen}
        onClose={() => setIsPDFUploaderOpen(false)}
        projectId={project.id}
        onSaved={refreshData}
      />

      {/* Invoice PDF Uploader */}
      <InvoicePDFUploader
        isOpen={isInvoicePDFUploaderOpen}
        onClose={() => setIsInvoicePDFUploaderOpen(false)}
        projectId={project.id}
        onSaved={refreshData}
      />

      {/* Invoice Drawer Modal - For editing existing invoices */}
      <InvoiceDrawer
        isOpen={isInvoiceDrawerOpen}
        onClose={() => setIsInvoiceDrawerOpen(false)}
        invoice={null}
        projectId={project.id}
        onSaved={refreshData}
      />

      {/* AI Prompt Settings Modal */}
      <AIPromptSettings
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </div>
  );
};