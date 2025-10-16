import { useState } from "react";
import { IncomeTable } from "./income/IncomeTable";
import { IncomeTrendChart } from "./income/IncomeTrendChart";
import { Card } from "@/components/ui/card";

interface IncomePageProps {
  onNavigate?: (page: string) => void;
}

export const IncomePage = ({ onNavigate }: IncomePageProps) => {
  return (
    <div className="flex-1 bg-gradient-to-br from-background to-muted/20 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Income</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all income transactions
            </p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <IncomeTrendChart />

        {/* Income Table */}
        <IncomeTable />
      </div>
    </div>
  );
};
