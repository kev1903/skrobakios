
import { useState } from "react";
import { CashFlowHeader } from "./cashflow/CashFlowHeader";
import { CashFlowCards } from "./cashflow/CashFlowCards";
import { CashFlowChart } from "./cashflow/CashFlowChart";
import { CashFlowTable } from "./cashflow/CashFlowTable";
import { CashFlowBreakdownDialog } from "./cashflow/CashFlowBreakdownDialog";
import { CashFlowPageProps, BreakdownData, CashFlowItem, CashFlowSummary } from "./cashflow/types";
import { CashFlowSummaryTable } from "./cashflow/CashFlowSummaryTable";

export const CashFlowPage = ({ onNavigate }: CashFlowPageProps) => {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cashIn: true,
    cashOut: true
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownData | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Opening balance (this would typically come from your data source)
  const openingBalance = { may: 22543, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0 };

  const cashInData: CashFlowItem[] = [
    { name: "Construction Revenue", may: 12645, jun: 5049, jul: 33927, aug: 0, sep: 0, oct: 0 },
    { name: "Consulting Revenue", may: 426587, jun: 426587, jul: 33970, aug: 291, sep: 0, oct: 0 },
    { name: "Other Revenue", may: 426587, jun: 426587, jul: 0, aug: 0, sep: 0, oct: 0 },
    { name: "Returns & Revenue", may: 426587, jun: 426587, jul: 0, aug: 0, sep: 0, oct: 0 },
  ];

  // Create opening balance item for Cash In table
  const openingBalanceItem: CashFlowItem = {
    name: "Opening Balance",
    ...openingBalance
  };

  // Combine opening balance with cash in data
  const cashInDataWithOpening = [openingBalanceItem, ...cashInData];

  const cashOutData: CashFlowItem[] = [
    { name: "ATO - ICA", may: 500, jun: 1703, jul: 868, aug: 2501, sep: 2501, oct: 2501 },
    { name: "ATO - BAS Payment", may: 0, jun: 0, jul: 250, aug: 250, sep: 250, oct: 250 },
    { name: "ATO Initial Payment Plan", may: 0, jun: 1700, jul: 400, aug: 600, sep: 600, oct: 600 },
    { name: "Tax - Wage - Kevin", may: 0, jun: 0, jul: 1650, aug: 1650, sep: 1650, oct: 1650 },
    { name: "Other Expenses", may: 363, jun: 0, jul: 632, aug: 0, sep: 0, oct: 363 },
  ];

  // Calculate totals for each month
  const calculateTotals = (data: CashFlowItem[]) => {
    return data.reduce((totals, item) => {
      const getValue = (val: number | string) => typeof val === 'number' ? val : 0;
      return {
        may: totals.may + getValue(item.may),
        jun: totals.jun + getValue(item.jun),
        jul: totals.jul + getValue(item.jul),
        aug: totals.aug + getValue(item.aug),
        sep: totals.sep + getValue(item.sep),
        oct: totals.oct + getValue(item.oct),
      };
    }, { may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0 });
  };

  const cashInTotals = calculateTotals(cashInData);
  const cashOutTotals = calculateTotals(cashOutData);

  // Calculate net movement (Cash In - Cash Out)
  const netMovement = {
    may: cashInTotals.may - cashOutTotals.may,
    jun: cashInTotals.jun - cashOutTotals.jun,
    jul: cashInTotals.jul - cashOutTotals.jul,
    aug: cashInTotals.aug - cashOutTotals.aug,
    sep: cashInTotals.sep - cashOutTotals.sep,
    oct: cashInTotals.oct - cashOutTotals.oct,
  };

  // Calculate ending balance (Opening Balance + Net Movement) - done sequentially
  const mayEndingBalance = openingBalance.may + netMovement.may;
  const junEndingBalance = mayEndingBalance + netMovement.jun;
  const julEndingBalance = junEndingBalance + netMovement.jul;
  const augEndingBalance = julEndingBalance + netMovement.aug;
  const sepEndingBalance = augEndingBalance + netMovement.sep;
  const octEndingBalance = sepEndingBalance + netMovement.oct;

  const endingBalance = {
    may: mayEndingBalance,
    jun: junEndingBalance,
    jul: julEndingBalance,
    aug: augEndingBalance,
    sep: sepEndingBalance,
    oct: octEndingBalance,
  };

  const summary: CashFlowSummary = {
    openingBalance: { name: "Opening Balance", ...openingBalance },
    netMovement: { name: "Net cash movement", ...netMovement },
    endingBalance: { name: "Ending balance", ...endingBalance },
  };

  // Sample breakdown data for demonstration
  const getBreakdownData = (itemName: string, month: string): BreakdownData => {
    if (itemName === "Construction Revenue" && month === "May 25") {
      return {
        title: "Construction Revenue",
        month: "May '25",
        items: [
          { date: "Paid - 01 May", description: "Ben Holst & Jacqui Junkeer", invoiceNumber: "INV-0277", amount: 3500.00, status: "Paid" },
          { date: "Paid - 12 May", description: "CourtScopes", invoiceNumber: "INV-0275", amount: 2050.06, status: "Paid" },
          { date: "Paid - 19 May", description: "Vista Plastering", invoiceNumber: "INV-0281", amount: 2090.00, status: "Paid" },
          { date: "Paid - 23 May", description: "Kings Cut Concrete Pty Ltd", invoiceNumber: "INV-0279", amount: 3025.00, status: "Paid" },
          { date: "Paid - 26 May", description: "Lyall Johaan", invoiceNumber: "INV-0283", amount: 907.50, status: "Paid" },
          { date: "Paid - 26 May", description: "Patrick & Nomsa", invoiceNumber: "INV-0285", amount: 3498.00, status: "Paid" },
          { date: "Paid - 27 May", description: "Vista Plastering", invoiceNumber: "INV-0284", amount: 2974.40, status: "Paid" },
        ],
        total: 18044.96,
        expected: 0.00,
        overExpected: 0.00
      };
    }

    // Default breakdown for other items
    return {
      title: itemName,
      month: month,
      items: [
        { date: "Paid - 15 " + month.split(' ')[0], description: "Sample Transaction 1", invoiceNumber: "INV-001", amount: 1200.00, status: "Paid" },
        { date: "Paid - 28 " + month.split(' ')[0], description: "Sample Transaction 2", invoiceNumber: "INV-002", amount: 850.00, status: "Paid" },
      ],
      total: 2050.00,
      expected: 500.00,
      overExpected: 0.00
    };
  };

  const handleCellClick = (itemName: string, month: string, value: any) => {
    // Only show breakdown for cells with actual values
    if (value !== 0 && value !== "" && value !== "0 of 0") {
      const breakdown = getBreakdownData(itemName, month);
      setSelectedBreakdown(breakdown);
      setShowBreakdown(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <CashFlowHeader 
        selectedScenario={selectedScenario}
        setSelectedScenario={setSelectedScenario}
      />

      <CashFlowCards />

      <CashFlowChart />

      {/* Cash Flow Tables */}
      <div className="space-y-6">
        <CashFlowTable
          title="Cash In"
          data={cashInDataWithOpening}
          isExpanded={expandedSections.cashIn}
          onToggle={() => toggleSection('cashIn')}
          onCellClick={handleCellClick}
          hasOpeningBalance={true}
        />

        <CashFlowTable
          title="Cash Out"
          data={cashOutData}
          isExpanded={expandedSections.cashOut}
          onToggle={() => toggleSection('cashOut')}
          onCellClick={handleCellClick}
        />

        {/* Summary Table */}
        <CashFlowSummaryTable
          netMovement={summary.netMovement}
          endingBalance={summary.endingBalance}
        />
      </div>

      <CashFlowBreakdownDialog
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        breakdownData={selectedBreakdown}
      />
    </div>
  );
};
