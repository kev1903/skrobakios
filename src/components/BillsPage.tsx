import { useState } from "react";
import { BillsHeader } from "./bills/BillsHeader";
import { BillsTable } from "./bills/BillsTable";
import { CompanyBillPDFUploader } from "./bills/CompanyBillPDFUploader";
import { MobileLayout, MobileContent } from "./MobileLayout";
import { useScreenSize } from "@/hooks/use-mobile";

interface BillsPageProps {
  onNavigate?: (page: string) => void;
}

export const BillsPage = ({ onNavigate }: BillsPageProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';

  const handleBillSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsUploadDialogOpen(false);
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileContent>
          <div className="space-y-4">
            <BillsHeader 
              onUploadClick={() => setIsUploadDialogOpen(true)}
            />
            <BillsTable refreshTrigger={refreshTrigger} />
          </div>
        </MobileContent>

        <CompanyBillPDFUploader
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onSaved={handleBillSaved}
        />
      </MobileLayout>
    );
  }

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
