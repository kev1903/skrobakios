import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncomeModule } from './income/IncomeModule';
import { ExpensesModule } from './expenses/ExpensesModule';
import { AnalyticsModule } from './analytics/AnalyticsModule';
import { Project } from '@/hooks/useProjects';

interface ProjectFinancePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectFinancePage = ({ project, onNavigate }: ProjectFinancePageProps) => {
  const [activeTab, setActiveTab] = useState('income');

  return (
    <div className="h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Project Finance
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage invoices, bills, and financial analytics for {project.name}
                </p>
              </div>
              <button
                onClick={() => onNavigate('project-cost')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Cost Management
              </button>
            </div>
          </div>

          {/* Main Finance Content */}
          <div className="bg-card border rounded-lg">
            {/* Finance Tabs Header */}
            <div className="bg-muted/30 border-b px-6 py-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-background/50 backdrop-blur-sm border">
                  <TabsTrigger 
                    value="income" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium"
                  >
                    Income
                  </TabsTrigger>
                  <TabsTrigger 
                    value="expenses"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium"
                  >
                    Expenses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-medium"
                  >
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Finance Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="income" className="p-0 m-0">
                <IncomeModule projectId={project.id} />
              </TabsContent>

              <TabsContent value="expenses" className="p-0 m-0">
                <ExpensesModule projectId={project.id} />
              </TabsContent>

              <TabsContent value="analytics" className="p-0 m-0">
                <AnalyticsModule projectId={project.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};