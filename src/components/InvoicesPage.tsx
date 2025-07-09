
import { InvoicesHeader } from "./invoices/InvoicesHeader";
import { InvoicesSummaryCards } from "./invoices/InvoicesSummaryCards";
import { InvoicesChart } from "./invoices/InvoicesChart";
import { InvoicesWarningBanner } from "./invoices/InvoicesWarningBanner";
import { InvoicesTable } from "./invoices/InvoicesTable";
import { useNavigate } from "react-router-dom";

interface InvoicesPageProps {
  onNavigate?: (page: string) => void;
}

export const InvoicesPage = ({ onNavigate }: InvoicesPageProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <InvoicesHeader onNavigate={onNavigate || (() => navigate('/'))} />
      <InvoicesSummaryCards />
      <InvoicesChart />
      <InvoicesWarningBanner />
      <InvoicesTable />
    </div>
  );
};
