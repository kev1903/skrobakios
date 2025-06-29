
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface FinanceHeaderProps {
  onNavigate?: (page: string) => void;
  onOpenSettings?: () => void;
}

export const FinanceHeader = ({ onNavigate, onOpenSettings }: FinanceHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial health monitoring and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="flex items-center space-x-2"
            onClick={() => onNavigate?.("cashflow")}
          >
            <span>CASHFLOW</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => onNavigate?.("invoices")}
          >
            <span>INVOICES</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => onNavigate?.("bills")}
          >
            <span>BILLS</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => onNavigate?.("recurring")}
          >
            <span>RECURRING</span>
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => onNavigate?.("finance-settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
