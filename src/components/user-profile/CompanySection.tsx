import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyDetailsSection } from '@/components/user-edit/CompanyDetailsSection';
import { CreateCompanyDialog } from '@/components/CreateCompanyDialog';
import { useUserRole } from '@/hooks/useUserRole';

interface CompanySectionProps {
  profileData: {
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const CompanySection = ({ profileData, onInputChange }: CompanySectionProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { isSuperAdmin } = useUserRole();

  return (
    <div className="space-y-8">
      {/* New Company Button for Superadmin */}
      {isSuperAdmin() && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Company
          </Button>
        </div>
      )}

      {/* Company Details */}
      <CompanyDetailsSection 
        profileData={{
          companyName: profileData.companyName,
          abn: profileData.abn,
          companyWebsite: profileData.companyWebsite,
          companyAddress: profileData.companyAddress,
          companyMembers: profileData.companyMembers,
          companyLogo: profileData.companyLogo,
          companySlogan: profileData.companySlogan,
        }}
        onInputChange={onInputChange}
      />

      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};