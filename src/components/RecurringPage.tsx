
import { RecurringHeader } from "./recurring/RecurringHeader";
import { RecurringSummaryCards } from "./recurring/RecurringSummaryCards";
import { RecurringChart } from "./recurring/RecurringChart";
import { RecurringWarningBanner } from "./recurring/RecurringWarningBanner";
import { RecurringTable } from "./recurring/RecurringTable";

interface RecurringPageProps {
  onNavigate?: (page: string) => void;
}

export const RecurringPage = ({ onNavigate }: RecurringPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <RecurringHeader onNavigate={onNavigate} />
      <RecurringSummaryCards />
      <RecurringChart />
      <RecurringWarningBanner />
      <RecurringTable />
    </div>
  );
};
