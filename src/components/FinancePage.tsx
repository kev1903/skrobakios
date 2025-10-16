import { useState } from 'react';
import { FinanceRibbon } from "./finance/FinanceRibbon";
import { FinanceDashboard } from "./finance/FinanceDashboard";
import { InvoicesPage } from "./InvoicesPage";
import { BillsPage } from "./BillsPage";
import { CashFlowPage } from "./CashFlowPage";
import { FinanceSettingsPage } from "./FinanceSettingsPage";
import { IncomePage } from "./IncomePage";
import { AiChatBar } from "./AiChatBar";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    onNavigate?.('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinanceDashboard />;
      case 'invoices':
        return <InvoicesPage onNavigate={onNavigate} />;
      case 'bills':
        return <BillsPage onNavigate={onNavigate} />;
      case 'cashflow':
        return <CashFlowPage onNavigate={onNavigate} />;
      case 'finance-settings':
        return <FinanceSettingsPage onNavigate={onNavigate} />;
      case 'income':
        return <IncomePage onNavigate={onNavigate} />;
      case 'expenses':
      case 'analytics':
      case 'recurring':
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h2>
              <p className="text-muted-foreground">
                This module is under development
              </p>
            </div>
          </div>
        );
      default:
        return <FinanceDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <FinanceRibbon 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBack={handleBack}
      />
      
      {renderContent()}
      
      {/* SkAi Floating Chat - Consistent across all finance pages */}
      <AiChatBar />
    </div>
  );
};
