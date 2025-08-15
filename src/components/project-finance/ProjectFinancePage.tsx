import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, DollarSign, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';

import { ExpensesModule } from './expenses/ExpensesModule';
import { AnalyticsModule } from './analytics/AnalyticsModule';
import { Project } from '@/hooks/useProjects';

interface ProjectFinancePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectFinancePage = ({ project, onNavigate }: ProjectFinancePageProps) => {
  const [activeTab, setActiveTab] = useState('income');

  const tabOptions = [
    { value: 'income', label: 'Income', icon: DollarSign },
    { value: 'expenses', label: 'Expense', icon: TrendingDown },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'cost-control', label: 'Cost Control', icon: AlertTriangle }
  ];

  const getCurrentTabLabel = () => {
    return tabOptions.find(tab => tab.value === activeTab)?.label || 'Income';
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate('project-cost')}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Cost Management
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Project Finance
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage invoices, bills, and financial analytics for {project.name}
                  </p>
                </div>
              </div>
              
              {/* Dropdown Menu in Top Right */}
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
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg">
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
            </div>
          </div>

          {/* Main Finance Content */}
          <div className="bg-card border rounded-lg">
            {/* Finance Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="income" className="p-0 m-0">
                <div className="p-6 text-center text-muted-foreground">
                  Income module has been removed.
                </div>
              </TabsContent>

              <TabsContent value="expenses" className="p-0 m-0">
                <ExpensesModule projectId={project.id} />
              </TabsContent>

              <TabsContent value="analytics" className="p-0 m-0">
                <AnalyticsModule projectId={project.id} />
              </TabsContent>

              <TabsContent value="cost-control" className="p-0 m-0">
                <div className="p-6 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Cost Control</h3>
                      <p>Cost control and budget management tools will be displayed here.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};