import React from 'react';
import { Crown, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRoleContext } from '@/contexts/RoleContext';
import { useCompany } from '@/contexts/CompanyContext';

export const ModeIndicator = () => {
  const { isPlatformMode, isCompanyMode, canSwitchMode } = useRoleContext();
  const { currentCompany } = useCompany();

  if (!canSwitchMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {isPlatformMode ? (
        <Badge 
          variant="outline" 
          className="bg-yellow-50/90 text-yellow-700 border-yellow-300 backdrop-blur-sm shadow-lg flex items-center gap-2"
        >
          <Crown className="h-3 w-3" />
          Platform Mode
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className="bg-blue-50/90 text-blue-700 border-blue-300 backdrop-blur-sm shadow-lg flex items-center gap-2"
        >
          <Building2 className="h-3 w-3" />
          {currentCompany ? `${currentCompany.name}` : 'Company Mode'}
        </Badge>
      )}
    </div>
  );
};