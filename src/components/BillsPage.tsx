
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
    <div className="w-full bg-background">
      <div className="p-6 space-y-6">
        <BillsHeader onNavigate={onNavigate} />
        <BillsSummaryCards />
        <BillsChart />
        <BillsWarningBanner />
        <BillsTable />
      </div>
    </div>
  );
};
