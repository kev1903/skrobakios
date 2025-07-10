import React from 'react';
import { NewUserPageHeader } from './components/NewUserPageHeader';
import { UserInvitationForm } from './components/UserInvitationForm';

interface NewUserPageProps {
  onNavigate: (page: string) => void;
}

export const NewUserPage = ({ onNavigate }: NewUserPageProps) => {
  const handleBack = () => {
    onNavigate('admin');
  };

  const handleSuccess = () => {
    onNavigate('admin');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <NewUserPageHeader onBack={handleBack} />
      <UserInvitationForm onCancel={handleBack} onSuccess={handleSuccess} />
    </div>
  );
};