
import { useState } from "react";
import { CashFlowTable } from "./CashFlowTable";
import { CashFlowSummaryTable } from "./CashFlowSummaryTable";
import { OpeningBalanceTable } from "./OpeningBalanceTable";
import { CashFlowBreakdownDialog } from "./CashFlowBreakdownDialog";
import { AddAccountDialog } from "./AddAccountDialog";
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
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccountSection, setAddAccountSection] = useState<'cashIn' | 'cashOut'>('cashIn');

  const {
    openingBalance,
    cashInData,
    cashOutData,
    cashInTotals,
    cashOutTotals,
    netMovement,
    endingBalance,
    addCashInAccount,
    addCashOutAccount
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

  const handleAddCashInAccount = () => {
    setAddAccountSection('cashIn');
    setShowAddAccount(true);
  };

  const handleAddCashOutAccount = () => {
    setAddAccountSection('cashOut');
    setShowAddAccount(true);
  };

  const handleAccountAdded = (account: any) => {
    if (addAccountSection === 'cashIn') {
      addCashInAccount(account);
    } else {
      addCashOutAccount(account);
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
        onAddAccount={handleAddCashInAccount}
        totals={cashInTotals}
      />

      <CashFlowTable
        title="Cash Out"
        data={cashOutData}
        isExpanded={expandedSections.cashOut}
        onToggle={() => toggleSection('cashOut')}
        onCellClick={handleCellClick}
        onAddAccount={handleAddCashOutAccount}
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

      <AddAccountDialog
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onAddAccount={handleAccountAdded}
        sectionTitle={addAccountSection === 'cashIn' ? 'Cash In' : 'Cash Out'}
      />
    </div>
  );
};
