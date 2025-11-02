import { useState } from "react";
import { ExpenseTable } from "./expense/ExpenseTable";
import { ExpenseTrendChart } from "./expense/ExpenseTrendChart";
import { Button } from "@/components/ui/button";
import { Settings, Upload } from "lucide-react";
import { CompanyBillPDFUploader } from "./bills/CompanyBillPDFUploader";

interface ExpensePageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: string) => void;
}

export const ExpensePage = ({ onNavigate, onTabChange }: ExpensePageProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBillSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="w-full bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all expense transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Bill
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange?.('expense-settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <ExpenseTrendChart />

        {/* Expense Table */}
        <ExpenseTable refreshTrigger={refreshTrigger} />
      </div>

      <CompanyBillPDFUploader
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSaved={handleBillSaved}
      />
    </div>
  );
};
