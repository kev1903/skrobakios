import { useState } from "react";
import { BillsHeader } from "./bills/BillsHeader";
import { BillsTable } from "./bills/BillsTable";
import { CompanyBillPDFUploader } from "./bills/CompanyBillPDFUploader";

interface BillsPageProps {
  onNavigate?: (page: string) => void;
}

export const BillsPage = ({ onNavigate }: BillsPageProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBillSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="w-full">
      <div className="p-6 space-y-6">
        <BillsHeader 
          onUploadClick={() => setIsUploadDialogOpen(true)}
        />
        <BillsTable refreshTrigger={refreshTrigger} />
      </div>

      <CompanyBillPDFUploader
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSaved={handleBillSaved}
      />
    </div>
  );
};
