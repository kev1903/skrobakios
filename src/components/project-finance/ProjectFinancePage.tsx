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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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

        {/* Finance Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border">
            <TabsTrigger 
              value="income" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Income
            </TabsTrigger>
            <TabsTrigger 
              value="expenses"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-6">
            <IncomeModule projectId={project.id} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesModule projectId={project.id} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsModule projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};