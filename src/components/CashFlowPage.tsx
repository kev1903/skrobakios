
import { useState } from "react";
import { CashFlowHeader } from "./cashflow/CashFlowHeader";
import { CashFlowCards } from "./cashflow/CashFlowCards";
import { CashFlowChart } from "./cashflow/CashFlowChart";
import { CashFlowTables } from "./cashflow/CashFlowTables";
import { CashFlowPageProps } from "./cashflow/types";

export const CashFlowPage = ({ onNavigate }: CashFlowPageProps) => {
  const [selectedScenario, setSelectedScenario] = useState("base");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <CashFlowHeader 
        selectedScenario={selectedScenario}
        setSelectedScenario={setSelectedScenario}
      />

      <CashFlowCards />

      <CashFlowChart />

      {/* Cash Flow Tables */}
      <CashFlowTables />
    </div>
  );
};
