
import { InvoicesHeader } from "./invoices/InvoicesHeader";
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
    <div className="w-full bg-background">
      <div className="p-6 space-y-6">
        <InvoicesHeader 
          onNavigate={onNavigate || (() => navigate('/finance'))} 
          onInvoicesSync={handleInvoicesSync}
        />
        <InvoicesTable key={`table-${refreshTrigger}`} />
      </div>
    </div>
  );
};
