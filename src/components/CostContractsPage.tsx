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
  const [activeTab, setActiveTab] = useState('contract-details');
  const tabs = [{
    id: 'contract-details',
    label: 'Contract Details',
    icon: FileText,
    component: ContractDetailsTab
  }, {
    id: 'cost-breakdown',
    label: 'Cost Breakdown',
    icon: Calculator,
    component: CostBreakdownTab
  }, {
    id: 'variations',
    label: 'Variations Register',
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
    id: 'cost-summary',
    label: 'Cost Summary',
    icon: BarChart3,
    component: CostSummaryDashboard
  }, {
    id: 'documents',
    label: 'Document Upload',
    icon: Upload,
    component: DocumentUploadTab
  }];
  return <div className="space-y-8">
      {/* Main Content */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full grid grid-cols-7 bg-white h-auto p-2 gap-1">
                {tabs.map(tab => {
                const IconComponent = tab.icon;
                return <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-2 p-4 rounded-lg
                        data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600
                        data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900
                        data-[state=inactive]:hover:bg-gray-50 transition-all duration-200
                        text-xs font-medium min-h-[80px]">
                      
                      <span className="text-center leading-tight">{tab.label}</span>
                    </TabsTrigger>;
              })}
              </TabsList>
            </div>

            <div className="p-8">
              {tabs.map(tab => {
              const Component = tab.component;
              return <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Component onNavigate={onNavigate} />
                  </TabsContent>;
            })}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};