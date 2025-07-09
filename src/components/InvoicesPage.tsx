
import { InvoicesHeader } from "./invoices/InvoicesHeader";
import { InvoicesSummaryCards } from "./invoices/InvoicesSummaryCards";
import { InvoicesWarningBanner } from "./invoices/InvoicesWarningBanner";
import { InvoicesTable } from "./invoices/InvoicesTable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface InvoicesPageProps {
  onNavigate?: (page: string) => void;
}

export const InvoicesPage = ({ onNavigate }: InvoicesPageProps) => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInvoicesSync = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <InvoicesHeader 
        onNavigate={onNavigate || (() => navigate('/'))} 
        onInvoicesSync={handleInvoicesSync}
      />
      <InvoicesSummaryCards key={`summary-${refreshTrigger}`} />
      <InvoicesWarningBanner key={`warning-${refreshTrigger}`} />
      <InvoicesTable key={`table-${refreshTrigger}`} />
    </div>
  );
};
