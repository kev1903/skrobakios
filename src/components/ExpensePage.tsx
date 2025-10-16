import { ExpenseTable } from "./expense/ExpenseTable";
import { ExpenseTrendChart } from "./expense/ExpenseTrendChart";

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
        </div>

        {/* Monthly Trend Chart */}
        <ExpenseTrendChart />

        {/* Expense Table */}
        <ExpenseTable />
      </div>
    </div>
  );
};
