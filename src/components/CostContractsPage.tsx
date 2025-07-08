import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calculator, FileCheck, TrendingUp, CreditCard, BarChart3, Upload } from 'lucide-react';
import { ContractDetailsTab } from './cost-contracts/ContractDetailsTab';
import { CostBreakdownTab } from './cost-contracts/CostBreakdownTab';
import { VariationsRegisterTab } from './cost-contracts/VariationsRegisterTab';
import { ProgressClaimsTab } from './cost-contracts/ProgressClaimsTab';
import { PaymentTrackingTab } from './cost-contracts/PaymentTrackingTab';
import { CostSummaryDashboard } from './cost-contracts/CostSummaryDashboard';
import { DocumentUploadTab } from './cost-contracts/DocumentUploadTab';
interface CostContractsPageProps {
  onNavigate?: (page: string) => void;
}
export const CostContractsPage = ({
  onNavigate
}: CostContractsPageProps) => {
  const [activeTab, setActiveTab] = useState('cost-breakdown');
  
  const tabs = [{
    id: 'cost-breakdown',
    label: 'Cost Breakdown',
    icon: Calculator,
    component: CostBreakdownTab
  }, {
    id: 'contract-details',
    label: 'Contract Details',
    icon: FileText,
    component: ContractDetailsTab
  }, {
    id: 'variations',
    label: 'Variations',
    icon: FileCheck,
    component: VariationsRegisterTab
  }, {
    id: 'progress-claims',
    label: 'Progress Claims',
    icon: TrendingUp,
    component: ProgressClaimsTab
  }, {
    id: 'payment-tracking',
    label: 'Payment Tracking',
    icon: CreditCard,
    component: PaymentTrackingTab
  }, {
    id: 'documents',
    label: 'Documents',
    icon: Upload,
    component: DocumentUploadTab
  }];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gradient heading-modern mb-2">
            Cost Management
          </h1>
          <p className="text-muted-foreground body-modern">
            Track and manage project costs, contracts, and financial performance
          </p>
        </div>

        {/* Unified Content Container */}
        <div className="glass-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Clean Tab Navigation */}
            <div className="border-b border-border/50 px-6 pt-4">
              <TabsList className="grid grid-cols-6 bg-muted/20 h-10 p-1 rounded-lg">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="flex items-center gap-2 px-3 py-2 rounded-md
                        data-[state=active]:bg-background data-[state=active]:text-foreground 
                        data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
                        transition-all duration-200 text-sm font-medium heading-modern"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {tabs.map(tab => {
                const Component = tab.component;
                return (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Component onNavigate={onNavigate} />
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};