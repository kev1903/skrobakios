import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2, Check, Plus } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { Badge } from '@/components/ui/badge';

interface BusinessSwitcherProps {
  onCreateBusiness?: () => void;
  showCreateOption?: boolean;
}

export const BusinessSwitcher: React.FC<BusinessSwitcherProps> = ({ 
  onCreateBusiness,
  showCreateOption = true 
}) => {
  const { currentCompany, companies, loading } = useCompany();
  const { setActiveBusiness } = useActiveBusiness();

  const handleSwitchBusiness = async (businessId: string) => {
    await setActiveBusiness(businessId);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        Loading...
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4" />
        No Business
      </div>
    );
  }

  const activeCompanies = companies.filter(company => company.status === 'active');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-sm justify-between min-w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentCompany?.name || 'Select Business'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl z-50">
        <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {activeCompanies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleSwitchBusiness(company.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{company.name}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {company.role}
                </Badge>
                <span>•</span>
                <span>{company.status}</span>
              </div>
            </div>
            {currentCompany?.id === company.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        {showCreateOption && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateBusiness}
              className="flex items-center gap-2 cursor-pointer text-primary"
            >
              <Plus className="h-4 w-4" />
              Create New Business
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};