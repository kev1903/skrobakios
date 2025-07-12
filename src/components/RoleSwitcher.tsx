import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Building2, Users, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRoleContext } from '@/contexts/RoleContext';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';

export const RoleSwitcher = () => {
  const { operatingMode, setOperatingMode, canSwitchMode, isPlatformMode, isCompanyMode } = useRoleContext();
  const { currentCompany } = useCompany();

  console.log('RoleSwitcher Debug:', { operatingMode, canSwitchMode, isPlatformMode, isCompanyMode });

  if (!canSwitchMode) {
    console.log('RoleSwitcher: Cannot switch mode, not showing switcher');
    return null;
  }

  const getModeIcon = () => {
    return isPlatformMode ? (
      <Crown className="h-4 w-4 text-yellow-600" />
    ) : (
      <Building2 className="h-4 w-4 text-blue-600" />
    );
  };

  const getModeLabel = () => {
    return isPlatformMode ? 'Platform Owner' : 'Company Owner';
  };

  const getModeBadge = () => {
    return isPlatformMode ? (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        Platform Mode
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
        Company Mode
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {getModeBadge()}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            {getModeIcon()}
            <span className="hidden sm:inline">{getModeLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Operating Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setOperatingMode('platform')}
            className={cn(
              "gap-3 cursor-pointer",
              isPlatformMode && "bg-yellow-50 text-yellow-900"
            )}
          >
            <Crown className="h-4 w-4 text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium">Platform Owner</div>
              <div className="text-xs text-muted-foreground">
                Manage entire platform and all companies
              </div>
            </div>
            {isPlatformMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => setOperatingMode('company')}
            className={cn(
              "gap-3 cursor-pointer",
              isCompanyMode && "bg-blue-50 text-blue-900"
            )}
          >
            <Building2 className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium">Company Owner</div>
              <div className="text-xs text-muted-foreground">
                {currentCompany ? 
                  `Operate within ${currentCompany.name}` :
                  'Operate within selected company'
                }
              </div>
            </div>
            {isCompanyMode && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};