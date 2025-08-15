import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

interface BusinessSwitcherProps {
  onBusinessChange?: (businessId: string, businessName: string) => void;
}

export const BusinessSwitcher = ({ onBusinessChange }: BusinessSwitcherProps) => {
  const { currentCompany, companies, switchCompany, loading } = useCompany();

  const handleSwitchBusiness = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      await switchCompany(companyId);
      onBusinessChange?.(companyId, company.name);
    }
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          {currentCompany?.name || 'Select Business'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl z-50">
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleSwitchBusiness(company.id)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{company.name}</span>
              <span className="text-xs text-muted-foreground">
                {company.role} • {company.status}
              </span>
            </div>
            {currentCompany?.id === company.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};