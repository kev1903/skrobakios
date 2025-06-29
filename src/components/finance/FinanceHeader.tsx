
import { Button } from "@/components/ui/button";
import { Calendar, Download, Plus } from "lucide-react";

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
          <Button variant="outline" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>This Month</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => onNavigate?.("cashflow")}
          >
            <Plus className="w-4 h-4" />
            <span>CASHFLOW</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
