import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserEditHeaderProps {
  activeSection: string;
  isSuperAdmin: () => boolean;
  onCreateCompany: () => void;
}

export const UserEditHeader = ({ 
  activeSection, 
  isSuperAdmin, 
  onCreateCompany 
}: UserEditHeaderProps) => {
  if (activeSection !== 'company') {
    return null;
  }

  return (
    <div className="flex-shrink-0 pt-20 px-8 py-6 border-b border-white/20">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-bold text-white">Company Portfolio</h1>
        {isSuperAdmin() && (
          <Button
            onClick={onCreateCompany}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Company
          </Button>
        )}
      </div>
      <p className="text-white/70">
        Track, analyze, and optimize how you spend your time
      </p>
    </div>
  );
};