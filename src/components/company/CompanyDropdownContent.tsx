import React from 'react';
import { Check, Building2, Plus } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  role: string;
}

interface CompanyDropdownContentProps {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  onSwitchCompany: (companyId: string) => void;
  onCreateCompany: () => void;
}

export const CompanyDropdownContent = ({
  companies,
  currentCompany,
  loading,
  onSwitchCompany,
  onCreateCompany
}: CompanyDropdownContentProps) => {
  return (
    <DropdownMenuContent className="w-[300px] mt-2 bg-white/10 backdrop-blur-md border-white/20" align="center">
      {loading ? (
        <DropdownMenuItem disabled>
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 animate-spin" />
            <span>Loading companies...</span>
          </div>
        </DropdownMenuItem>
      ) : companies.length === 0 ? (
        <>
          <DropdownMenuItem disabled>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>No companies found</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreateCompany}>
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Your First Company</span>
            </div>
          </DropdownMenuItem>
        </>
      ) : (
        <>
          {/* Current Companies List */}
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => onSwitchCompany(company.id)}
              className="flex items-center justify-between p-3 hover:bg-accent"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={company.logo_url} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {company.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[180px]">{company.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{company.role}</span>
                </div>
              </div>
              {currentCompany?.id === company.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </>
      )}
    </DropdownMenuContent>
  );
};