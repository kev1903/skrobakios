import { useState } from "react";
import { BillsHeader } from "./bills/BillsHeader";
import { BillsTable } from "./bills/BillsTable";
import { CompanyBillPDFUploader } from "./bills/CompanyBillPDFUploader";

interface BillsPageProps {
  onNavigate?: (page: string) => void;
}

export const BillsPage = ({ onNavigate }: BillsPageProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="p-6 space-y-6">
        <BillsHeader 
          onUploadClick={() => setIsUploadDialogOpen(true)}
        />
        <BillsTable />
      </div>

      <CompanyBillPDFUploader
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSaved={() => {
          // Refresh bills table data here when implemented
          console.log('Bill saved, refresh table');
        }}
      />
    </div>
  );
};
