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
  return;
};