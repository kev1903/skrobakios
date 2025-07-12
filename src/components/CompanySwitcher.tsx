import React, { useState } from 'react';
import { Check, ChevronDown, Building2, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompany } from '@/contexts/CompanyContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateCompanyDialog } from './CreateCompanyDialog';

interface CompanySwitcherProps {
  onNavigate?: (page: string) => void;
}

export const CompanySwitcher = ({ onNavigate }: CompanySwitcherProps = {}) => {
  const { currentCompany, companies, switchCompany, loading } = useCompany();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return (
      <Button variant="ghost" className="w-[200px] justify-between" disabled>
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>Loading...</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  if (!currentCompany) {
    return (
      <Button variant="ghost" className="w-[200px] justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>No Company</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-[200px] justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={currentCompany.logo_url} />
              <AvatarFallback className="text-xs">
                {currentCompany.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{currentCompany.name}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl z-50" align="start">
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={company.logo_url} />
                <AvatarFallback className="text-xs">
                  {company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{company.name}</span>
            </div>
            {currentCompany?.id === company.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {onNavigate && (
          <DropdownMenuItem onClick={() => onNavigate('company-settings')}>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Company Settings</span>
            </div>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
          <div className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Company</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DropdownMenu>
  );
};