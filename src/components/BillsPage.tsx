
import { BillsHeader } from "./bills/BillsHeader";
import { BillsSummaryCards } from "./bills/BillsSummaryCards";
import { BillsChart } from "./bills/BillsChart";
import { BillsWarningBanner } from "./bills/BillsWarningBanner";
import { BillsTable } from "./bills/BillsTable";

interface BillsPageProps {
  onNavigate?: (page: string) => void;
}

export const BillsPage = ({ onNavigate }: BillsPageProps) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <BillsHeader onNavigate={onNavigate} />
      <BillsSummaryCards />
      <BillsChart />
      <BillsWarningBanner />
      <BillsTable />
    </div>
  );
};
