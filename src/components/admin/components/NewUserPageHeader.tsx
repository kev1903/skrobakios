import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewUserPageHeaderProps {
  onBack: () => void;
}

export const NewUserPageHeader = ({ onBack }: NewUserPageHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invite New User</h1>
        <p className="text-gray-600 mt-1">Send an invitation to join the platform</p>
      </div>
    </div>
  );
};