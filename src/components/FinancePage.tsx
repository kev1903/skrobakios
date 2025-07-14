
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { FinanceHeader } from "./finance/FinanceHeader";
import { FinanceAlerts } from "./finance/FinanceAlerts";
import { CashFlowSection } from "./finance/CashFlowSection";
import { ProfitabilitySection } from "./finance/ProfitabilitySection";
import { ReceivablesSection } from "./finance/ReceivablesSection";
import { ProjectCostingSection } from "./finance/ProjectCostingSection";
import { ExpensesSection } from "./finance/ExpensesSection";
import { FinancialRatiosSection } from "./finance/FinancialRatiosSection";
import { RevenuePipelineSection } from "./finance/RevenuePipelineSection";
import { ComplianceSection } from "./finance/ComplianceSection";

interface FinancePageProps {
  onNavigate?: (page: string) => void;
}

export const FinancePage = ({ onNavigate }: FinancePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => onNavigate?.('home')}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Button>
      </div>
      <FinanceHeader onNavigate={onNavigate} />
      <FinanceAlerts />
      <CashFlowSection />
      <ProfitabilitySection />
      
      {/* Accounts Receivable & Project Costing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ReceivablesSection />
        <ProjectCostingSection />
      </div>

      {/* Expenses & Financial Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExpensesSection />
        <FinancialRatiosSection />
      </div>

      {/* Pipeline & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenuePipelineSection />
        <ComplianceSection />
      </div>
    </div>
  );
};
