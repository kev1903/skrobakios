import React from 'react';
import { UserEditLayout } from '@/components/user-edit/UserEditLayout';
import { CompanyEditPage } from '@/components/CompanyEditPage';
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
    editingCompanyId,
    handleInputChange,
    handleArrayChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleSave,
    handleCancel,
    handleEditCompany,
    handleBackFromCompanyEdit
  } = useUserEdit();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  // Show company edit page if editing a company
  if (editingCompanyId) {
    return (
      <CompanyEditPage
        companyId={editingCompanyId}
        onNavigateBack={handleBackFromCompanyEdit}
      />
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
      onArrayChange={handleArrayChange}
      onAddArrayItem={handleAddArrayItem}
      onRemoveArrayItem={handleRemoveArrayItem}
      onCreateCompany={() => setShowCreateDialog(true)}
      onCloseCreateDialog={() => setShowCreateDialog(false)}
      onEditCompany={handleEditCompany}
    />
  );
};