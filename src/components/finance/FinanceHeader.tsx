
import { Button } from "@/components/ui/button";

interface FinanceHeaderProps {
  onNavigate?: (page: string) => void;
}

export const FinanceHeader = ({ onNavigate }: FinanceHeaderProps) => {
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
        </div>
      </div>
    </div>
  );
};
