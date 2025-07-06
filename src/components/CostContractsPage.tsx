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

export const CostContractsPage = ({ onNavigate }: CostContractsPageProps) => {
  const [activeTab, setActiveTab] = useState('contract-details');

  const tabs = [
    {
      id: 'contract-details',
      label: 'Contract Details',
      icon: FileText,
      component: ContractDetailsTab
    },
    {
      id: 'cost-breakdown',
      label: 'Cost Breakdown',
      icon: Calculator,
      component: CostBreakdownTab
    },
    {
      id: 'variations',
      label: 'Variations Register',
      icon: FileCheck,
      component: VariationsRegisterTab
    },
    {
      id: 'progress-claims',
      label: 'Progress Claims',
      icon: TrendingUp,
      component: ProgressClaimsTab
    },
    {
      id: 'payment-tracking',
      label: 'Payment Tracking',
      icon: CreditCard,
      component: PaymentTrackingTab
    },
    {
      id: 'cost-summary',
      label: 'Cost Summary',
      icon: BarChart3,
      component: CostSummaryDashboard
    },
    {
      id: 'documents',
      label: 'Document Upload',
      icon: Upload,
      component: DocumentUploadTab
    }
  ];

  return (
    <div className="h-full overflow-auto backdrop-blur-xl bg-black/20 border border-white/10 shadow-2xl">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-playfair">
            Project Cost & Contract Management
          </h1>
          <p className="text-white/80 font-helvetica">
            Track contracts, cost breakdowns, variations, claims, and payments for construction projects
          </p>
        </div>

        {/* Main Content */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-white/20 bg-black/20 backdrop-blur-sm">
                <TabsList className="w-full grid grid-cols-7 bg-transparent h-auto p-2 gap-1">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl
                          data-[state=active]:bg-white/20 data-[state=active]:text-white
                          data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white
                          data-[state=inactive]:hover:bg-white/10 transition-all duration-300
                          text-xs font-medium min-h-[80px]"
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-center leading-tight">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <div className="p-8">
                {tabs.map((tab) => {
                  const Component = tab.component;
                  return (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      <Component onNavigate={onNavigate} />
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};