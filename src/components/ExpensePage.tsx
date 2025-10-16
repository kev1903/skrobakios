import { ExpenseTable } from "./expense/ExpenseTable";
import { ExpenseTrendChart } from "./expense/ExpenseTrendChart";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface ExpensePageProps {
  onNavigate?: (page: string) => void;
}

export const ExpensePage = ({ onNavigate }: ExpensePageProps) => {
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('expense-settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Monthly Trend Chart */}
        <ExpenseTrendChart />

        {/* Expense Table */}
        <ExpenseTable />
      </div>
    </div>
  );
};
