
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinanceHeaderProps {
  onNavigate?: (page: string) => void;
  onOpenSettings?: () => void;
}

export const FinanceHeader = ({ onNavigate, onOpenSettings }: FinanceHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.("home")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
            <p className="text-gray-600">Comprehensive financial health monitoring and insights</p>
          </div>
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
            onClick={() => navigate('/invoices')}
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
