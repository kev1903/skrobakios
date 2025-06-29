
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RecurringHeaderProps {
  onNavigate?: (page: string) => void;
}

export const RecurringHeader = ({ onNavigate }: RecurringHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.("finance")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Finance</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Transactions</h1>
            <p className="text-gray-600">Manage automated and recurring financial transactions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="flex items-center space-x-2">
            <span>Add Recurring Item</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
