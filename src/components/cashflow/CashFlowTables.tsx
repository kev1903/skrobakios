
import { useState } from "react";
import { CashFlowTable } from "./CashFlowTable";
import { CashFlowSummaryTable } from "./CashFlowSummaryTable";
import { OpeningBalanceTable } from "./OpeningBalanceTable";
import { CashFlowBreakdownDialog } from "./CashFlowBreakdownDialog";
import { BreakdownData } from "./types";
import { useCashFlowData } from "./useCashFlowData";
import { useCashFlowBreakdown } from "./useCashFlowBreakdown";

export const CashFlowTables = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cashIn: true,
    cashOut: true
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownData | null>(null);

  const {
    openingBalance,
    cashInData,
    cashOutData,
    cashInTotals,
    cashOutTotals,
    netMovement,
    endingBalance
  } = useCashFlowData();

  const { getBreakdownData } = useCashFlowBreakdown();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCellClick = (itemName: string, month: string, value: any) => {
    // Only show breakdown for cells with actual values
    if (value !== 0 && value !== "" && value !== "0 of 0") {
      const breakdown = getBreakdownData(itemName, month);
      setSelectedBreakdown(breakdown);
      setShowBreakdown(true);
    }
  };

  const summary = {
    netMovement: { name: "Net cash movement", ...netMovement },
    endingBalance: { name: "Ending balance", ...endingBalance },
  };

  return (
    <div className="space-y-6">
      {/* Opening Balance Row */}
      <OpeningBalanceTable openingBalance={openingBalance} />

      <CashFlowTable
        title="Cash In"
        data={cashInData}
        isExpanded={expandedSections.cashIn}
        onToggle={() => toggleSection('cashIn')}
        onCellClick={handleCellClick}
        totals={cashInTotals}
      />

      <CashFlowTable
        title="Cash Out"
        data={cashOutData}
        isExpanded={expandedSections.cashOut}
        onToggle={() => toggleSection('cashOut')}
        onCellClick={handleCellClick}
        totals={cashOutTotals}
      />

      {/* Summary Table */}
      <CashFlowSummaryTable
        netMovement={summary.netMovement}
        endingBalance={summary.endingBalance}
      />

      <CashFlowBreakdownDialog
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        breakdownData={selectedBreakdown}
      />
    </div>
  );
};
