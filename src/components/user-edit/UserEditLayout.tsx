import React from 'react';
import { UserEditNavigation } from '@/components/user-edit/UserEditNavigation';
import { UserEditHeader } from '@/components/user-edit/UserEditHeader';
import { UserEditContent } from '@/components/user-edit/UserEditContent';
import { CreateCompanyDialog } from '@/components/CreateCompanyDialog';

interface UserEditLayoutProps {
  profileData: {
    firstName: string;
    lastName: string;
    avatarUrl: string;
    email: string;
    phone: string;
    birthDate: string;
    jobTitle: string;
    location: string;
    website: string;
    bio: string;
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
  };
  activeSection: string;
  saving: boolean;
  showCreateDialog: boolean;
  isSuperAdmin: () => boolean;
  onSectionChange: (section: string) => void;
  onNavigate: (page: string) => void;
  onSave: () => void;
  onInputChange: (field: string, value: string) => void;
  onCreateCompany: () => void;
  onCloseCreateDialog: () => void;
}

export const UserEditLayout = ({
  profileData,
  activeSection,
  saving,
  showCreateDialog,
  isSuperAdmin,
  onSectionChange,
  onNavigate,
  onSave,
  onInputChange,
  onCreateCompany,
  onCloseCreateDialog
}: UserEditLayoutProps) => {
  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Profile Sidebar - Matching Project Layout */}
      <UserEditNavigation 
        firstName={profileData.firstName} 
        lastName={profileData.lastName} 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
        onNavigate={onNavigate} 
        onSave={onSave} 
        saving={saving} 
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-48 flex flex-col">
        {/* Content Header - Only show for Company section */}
        <UserEditHeader
          activeSection={activeSection}
          isSuperAdmin={isSuperAdmin}
          onCreateCompany={onCreateCompany}
        />

        {/* Scrollable Content */}
        <UserEditContent
          activeSection={activeSection}
          profileData={profileData}
          onInputChange={onInputChange}
          onNavigate={onNavigate}
        />
      </div>

      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={onCloseCreateDialog}
      />
    </div>
  );
};