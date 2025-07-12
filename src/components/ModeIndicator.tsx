import React from 'react';
import { Crown, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRoleContext } from '@/contexts/RoleContext';
import { useCompany } from '@/contexts/CompanyContext';
export const ModeIndicator = () => {
  const {
    isPlatformMode,
    isCompanyMode,
    canSwitchMode
  } = useRoleContext();
  const {
    currentCompany
  } = useCompany();
  if (!canSwitchMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
        {isPlatformMode ? (
          <>
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">Platform Mode</span>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">
              {currentCompany?.name || 'Company Mode'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};