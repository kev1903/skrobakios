
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface InvoicesHeaderProps {
  onNavigate?: (page: string) => void;
}

export const InvoicesHeader = ({ onNavigate }: InvoicesHeaderProps) => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">Manage and track all your invoices</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="flex items-center space-x-2">
            <span>Sync Invoices</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
