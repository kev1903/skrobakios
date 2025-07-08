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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gradient heading-modern mb-2">
            Cost Management
          </h1>
          <p className="text-muted-foreground body-modern">
            Track and manage project costs, contracts, and financial performance
          </p>
        </div>

        {/* Main Content */}
        <div className="glass-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border bg-muted/30 rounded-t-2xl">
              <TabsList className="w-full grid grid-cols-6 bg-transparent h-auto p-4 gap-2">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="flex items-center gap-2 p-3 rounded-lg
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                        data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
                        data-[state=inactive]:hover:bg-accent transition-all duration-200
                        text-sm font-medium heading-modern min-h-[48px]"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="p-8">
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