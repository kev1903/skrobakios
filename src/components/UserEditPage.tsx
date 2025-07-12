import React from 'react';
import { UserEditLayout } from '@/components/user-edit/UserEditLayout';
import { useUserEdit } from '@/hooks/useUserEdit';

interface UserEditPageProps {
  onNavigate: (page: string) => void;
}

export const UserEditPage = ({ onNavigate }: UserEditPageProps) => {
  const {
    profileData,
    activeSection,
    setActiveSection,
    showCreateDialog,
    setShowCreateDialog,
    saving,
    loading,
    isSuperAdmin,
    handleInputChange,
    handleSave,
    handleCancel
  } = useUserEdit();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <UserEditLayout
      profileData={profileData}
      activeSection={activeSection}
      saving={saving}
      showCreateDialog={showCreateDialog}
      isSuperAdmin={isSuperAdmin}
      onSectionChange={setActiveSection}
      onNavigate={onNavigate}
      onSave={handleSave}
      onInputChange={handleInputChange}
      onCreateCompany={() => setShowCreateDialog(true)}
      onCloseCreateDialog={() => setShowCreateDialog(false)}
    />
  );
};