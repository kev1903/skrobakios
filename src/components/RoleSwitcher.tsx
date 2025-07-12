import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Crown, Building2 } from 'lucide-react';
import { useRoleContext } from '@/contexts/RoleContext';
import { useCompany } from '@/contexts/CompanyContext';

export const RoleSwitcher = () => {
  const { operatingMode, setOperatingMode, canSwitchMode, isPlatformMode, isCompanyMode } = useRoleContext();
  const { currentCompany } = useCompany();

  console.log('RoleSwitcher Debug:', { operatingMode, canSwitchMode, isPlatformMode, isCompanyMode });

  // For testing: show a temporary test button if user is logged in but no role
  if (!canSwitchMode) {
    console.log('RoleSwitcher: Cannot switch mode, not showing switcher');
    
    // Show a test button for development/testing
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
          No Role Assigned
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            console.log('Test button clicked - role switching not available');
            alert('Role switching is only available for SuperAdmin users. Please contact an administrator to assign you the SuperAdmin role.');
          }}
          className="h-8 gap-2"
        >
          <Crown className="h-3 w-3" />
          <span className="hidden sm:inline">Test Role Switch</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="flex items-center gap-2 min-w-0">
        {isPlatformMode ? (
          <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
        ) : (
          <Building2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
        )}
        <span className="text-sm font-medium text-sidebar-foreground truncate">
          {isPlatformMode ? 'Platform' : 'Company'}
        </span>
      </div>
      
      <Switch
        checked={isPlatformMode}
        onCheckedChange={(checked) => setOperatingMode(checked ? 'platform' : 'company')}
        className="flex-shrink-0"
      />
    </div>
  );
};