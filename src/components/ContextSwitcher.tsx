import React from 'react';
import { User, Building2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppContext, ContextType } from '@/contexts/AppContextProvider';
import { Badge } from '@/components/ui/badge';

interface ContextSwitcherProps {
  onNavigate?: (page: string) => void;
}

interface ActiveContext {
  type: ContextType;
  name: string;
  avatar?: string;
  description?: string;
}

export const ContextSwitcher = ({ onNavigate }: ContextSwitcherProps = {}) => {
  const { userProfile } = useUser();
  const { currentCompany, companies, switchCompany, loading } = useCompany();
  const { activeContext, setActiveContext } = useAppContext();

  if (loading) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-between text-white hover:bg-white/20 hover:text-white border border-white/20 bg-white/5" 
        disabled
      >
        Loading...
      </Button>
    );
  }

  const getActiveContextInfo = (): ActiveContext => {
    if (activeContext === 'personal') {
      return {
        type: 'personal',
        name: `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email?.split('@')[0] || 'Personal',
        avatar: userProfile.avatarUrl,
        description: userProfile.jobTitle || 'Personal workspace'
      };
    } else {
      // Check if company name looks like an auto-generated default
      const isDefaultCompanyName = currentCompany?.name && (
        currentCompany.name.includes('@') || 
        currentCompany.name.endsWith('\'s Business') ||
        currentCompany.name.endsWith('\'s Company')
      );
      
      return {
        type: 'company',
        name: currentCompany?.name || 'Select Business',
        avatar: currentCompany?.logo_url,
        description: isDefaultCompanyName ? 'Default business' : (currentCompany ? 'Business workspace' : 'No business selected')
      };
    }
  };

  const currentContext = getActiveContextInfo();

  const handleContextSwitch = (contextType: ContextType, companyId?: string) => {
    setActiveContext(contextType);
    
    if (contextType === 'company' && companyId && companyId !== currentCompany?.id) {
      switchCompany(companyId);
    }
    
    // Navigate to appropriate dashboard
    if (contextType === 'personal') {
      onNavigate?.('personal-dashboard');
    } else {
      onNavigate?.('home');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between text-white hover:bg-white/20 hover:text-white border border-white/20 bg-white/5 h-auto p-3"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={currentContext.avatar} alt={currentContext.name} />
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {currentContext.type === 'personal' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm truncate">{currentContext.name}</span>
                 <Badge 
                   variant="secondary" 
                   className="bg-white/20 text-white text-xs px-1.5 py-0.5"
                 >
                   {currentContext.type === 'personal' ? 'Personal' : 'Business'}
                 </Badge>
              </div>
              {currentContext.description && (
                <span className="text-xs text-white/70 truncate max-w-full">
                  {currentContext.description}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-white/95 backdrop-blur-md border-white/20" 
        align="start"
      >
        {/* Personal Context */}
        <DropdownMenuItem 
          className="p-3 cursor-pointer"
          onClick={() => handleContextSwitch('personal')}
        >
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatarUrl} alt="Personal" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="font-medium text-sm">
                     {`${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email?.split('@')[0] || 'Personal'}
                   </span>
                  <span className="text-xs text-muted-foreground">
                    Personal workspace
                  </span>
                </div>
                {activeContext === 'personal' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </div>
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
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(company.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm truncate">{company.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {company.role} • Business workspace
                        </span>
                      </div>
                      {activeContext === 'company' && currentCompany?.id === company.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
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