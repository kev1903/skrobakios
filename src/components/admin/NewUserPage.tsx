import React from 'react';
import { NewUserPageHeader } from './components/NewUserPageHeader';
import { DirectUserCreationForm } from './DirectUserCreationForm';

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
      <DirectUserCreationForm onCancel={handleBack} onSuccess={handleSuccess} />
    </div>
  );
};