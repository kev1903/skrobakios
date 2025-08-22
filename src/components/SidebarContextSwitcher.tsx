import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppContext, ContextType } from '@/contexts/AppContextProvider';

interface SidebarContextSwitcherProps {
  onNavigate?: (page: string) => void;
  isCollapsed?: boolean;
}

export const SidebarContextSwitcher = ({ onNavigate, isCollapsed = false }: SidebarContextSwitcherProps) => {
  const { userProfile } = useUser();
  const { currentCompany, companies, switchCompany, loading } = useCompany();
  const { activeContext, setActiveContext } = useAppContext();

  if (loading) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground hover:bg-white/20 hover:text-white border border-white/20 bg-white/5 h-auto p-2" 
        disabled
      >
        Loading...
      </Button>
    );
  }

  // Get display names
  const getUserName = () => {
    return `${userProfile.firstName} ${userProfile.lastName}`.trim() || 
           userProfile.email?.split('@')[0] || 
           'Personal';
  };

  const getBusinessName = () => {
    if (!currentCompany?.name) return 'No Business';
    
    // Check if company name looks like an auto-generated default
    const isDefaultCompanyName = currentCompany.name && (
      currentCompany.name.includes('@') || 
      currentCompany.name.endsWith('\'s Business') ||
      currentCompany.name.endsWith('\'s Company')
    );
    
    return isDefaultCompanyName ? 'Default Business' : currentCompany.name;
  };

  // Filter out auto-generated company names for display purposes
  const realBusinesses = companies.filter(company => {
    const isDefaultCompanyName = company.name && (
      company.name.includes('@') || 
      company.name.endsWith('\'s Business') ||
      company.name.endsWith('\'s Company')
    );
    return !isDefaultCompanyName;
  });

  console.log('SidebarContextSwitcher - All companies:', companies);
  console.log('SidebarContextSwitcher - Real businesses after filtering:', realBusinesses);

  const handleContextSwitch = (contextType: ContextType, companyId?: string) => {
    setActiveContext(contextType);
    
    if (contextType === 'company' && companyId && companyId !== currentCompany?.id) {
      switchCompany(companyId);
    }
    
    // Navigate to appropriate page based on context
    if (contextType === 'personal') {
      onNavigate?.('profile');
    } else if (contextType === 'company') {
      onNavigate?.('home'); // Navigate to business homepage
    }
  };

  const displayText = activeContext === 'personal' ? getUserName() : getBusinessName();
  const contextType = activeContext === 'personal' ? 'Personal' : 'Business';

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-10 p-2 text-muted-foreground hover:bg-white/20 hover:text-white border border-white/20 bg-white/5"
          >
            <div className="w-full text-center">
              <div className="text-xs font-medium truncate">
                {displayText.charAt(0).toUpperCase()}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 bg-background border shadow-lg z-[10001]" 
          align="start"
          side="right"
        >
          {/* Personal Context */}
          <DropdownMenuItem 
            className="p-3 cursor-pointer"
            onClick={() => handleContextSwitch('personal')}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{getUserName()}</span>
                <span className="text-xs text-muted-foreground">Personal</span>
              </div>
              {activeContext === 'personal' && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Businesses */}
          {realBusinesses.length > 0 && (
            <>
              <div className="px-2 py-1">
                <span className="text-xs font-medium text-muted-foreground">Businesses</span>
              </div>
              {realBusinesses.map((company) => (
                <DropdownMenuItem 
                  key={company.id}
                  className="p-3 cursor-pointer"
                  onClick={() => handleContextSwitch('company', company.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm truncate">{company.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {company.role} • Business
                      </span>
                    </div>
                    {activeContext === 'company' && currentCompany?.id === company.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {realBusinesses.length === 0 && (
            <div className="px-2 py-1">
              <span className="text-xs text-muted-foreground">No businesses created yet</span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between text-muted-foreground hover:bg-white/20 hover:text-white border border-white/20 bg-white/5 h-auto p-3"
        >
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="font-medium text-sm truncate w-full text-left">{displayText}</span>
            <span className="text-xs text-muted-foreground/70 truncate w-full text-left">{contextType}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-background border shadow-lg z-[10001]" 
        align="start"
      >
        {/* Personal Context */}
        <DropdownMenuItem 
          className="p-3 cursor-pointer"
          onClick={() => handleContextSwitch('personal')}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{getUserName()}</span>
              <span className="text-xs text-muted-foreground">Personal</span>
            </div>
            {activeContext === 'personal' && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Businesses */}
        {realBusinesses.length > 0 && (
          <>
            <div className="px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">Businesses</span>
            </div>
            {realBusinesses.map((company) => (
              <DropdownMenuItem 
                key={company.id}
                className="p-3 cursor-pointer"
                onClick={() => handleContextSwitch('company', company.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate">{company.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {company.role} • Business
                    </span>
                  </div>
                  {activeContext === 'company' && currentCompany?.id === company.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {realBusinesses.length === 0 && (
          <div className="px-2 py-1">
            <span className="text-xs text-muted-foreground">No businesses created yet</span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};