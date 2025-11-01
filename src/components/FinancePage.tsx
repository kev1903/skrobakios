import { useState } from 'react';
import { FinanceRibbon } from "./finance/FinanceRibbon";
import { FinanceDashboard } from "./finance/FinanceDashboard";
import { InvoicesPage } from "./InvoicesPage";
import { BillsPage } from "./BillsPage";
import { CashFlowPage } from "./CashFlowPage";
import { FinanceSettingsPage } from "./FinanceSettingsPage";
import { IncomePage } from "./IncomePage";
import { ExpensePage } from "./ExpensePage";
import { ExpenseSettingsPage } from "./ExpenseSettingsPage";
import { AiChatBar } from "./AiChatBar";
import { useScreenSize } from "@/hooks/use-mobile";
import { MobileLayout, MobileContent } from "./MobileLayout";
import { Button } from "./ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const screenSize = useScreenSize();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Close mobile menu after selection
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
        return <ExpensePage onNavigate={onNavigate} onTabChange={handleTabChange} />;
      case 'expense-settings':
        return <ExpenseSettingsPage onNavigate={onNavigate} onTabChange={handleTabChange} />;
      case 'analytics':
      case 'recurring':
        return (
          <div className="w-full flex items-center justify-center p-8">
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

  if (isMobile) {
    return (
      <MobileLayout fullHeight className="bg-gradient-to-br from-background to-muted/20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <h1 className="text-lg font-semibold">Finance</h1>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <FinanceRibbon 
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onBack={handleBack}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Content */}
        <MobileContent withPadding={false}>
          {renderContent()}
        </MobileContent>

        {/* AI Chat Bar - Mobile positioned */}
        <AiChatBar />
      </MobileLayout>
    );
  }

  return (
    <div className="fixed top-[var(--header-height)] left-0 right-0 bottom-0 flex">
      <FinanceRibbon 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
      
      {/* SkAi Floating Chat - Consistent across all finance pages */}
      <AiChatBar />
    </div>
  );
};
