import React, { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { Check, ChevronDown, Building2, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateCompanyDialog } from './CreateCompanyDialog';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { currentCompany, companies, switchCompany, loading, refreshCompanies } = useCompany();
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Refresh companies periodically to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCompanies();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshCompanies]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking) {
      // Create animated pulsing effect when AI is speaking
      interval = setInterval(() => {
        setPulseIntensity(prev => (prev + 0.1) % (Math.PI * 2));
      }, 50);
    } else {
      setPulseIntensity(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  const getGlowIntensity = () => {
    if (!isSpeaking) return 0;
    return 0.3 + Math.sin(pulseIntensity) * 0.2; // Oscillates between 0.1 and 0.5
  };

  const getScaleIntensity = () => {
    if (!isSpeaking) return 1;
    return 1 + Math.sin(pulseIntensity * 1.5) * 0.05; // Slight scale animation
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="pointer-events-auto relative group cursor-pointer"
            style={{
              transform: `scale(${getScaleIntensity()})`,
              transition: isSpeaking ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {/* AI Speaking Glow Effects */}
            {isSpeaking && (
              <>
                {/* Outer glow ring */}
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, rgba(59, 130, 246, ${getGlowIntensity()}) 0%, rgba(59, 130, 246, 0) 70%)`,
                    filter: 'blur(20px)',
                    transform: 'scale(2)',
                  }}
                />
                
                {/* Inner glow ring */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(147, 197, 253, ${getGlowIntensity() * 0.6}) 0%, rgba(147, 197, 253, 0) 60%)`,
                    filter: 'blur(10px)',
                    transform: 'scale(1.5)',
                  }}
                />

                {/* Particle effects */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-300 rounded-full animate-ping"
                      style={{
                        top: `${20 + Math.sin((pulseIntensity + i) * 0.5) * 30}%`,
                        left: `${20 + Math.cos((pulseIntensity + i) * 0.5) * 30}%`,
                        animationDelay: `${i * 0.2}s`,
                        opacity: getGlowIntensity(),
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Company Name with Switcher Indicator */}
            <div className="relative px-8 py-4 flex items-center gap-2">
              <h1 
                className="text-pure-white font-bold text-2xl tracking-wide text-center whitespace-nowrap heading-modern"
                style={{
                  textShadow: isSpeaking 
                    ? `0 0 ${10 + getGlowIntensity() * 20}px rgba(59, 130, 246, ${getGlowIntensity()})` 
                    : '0 2px 4px rgba(0,0,0,0.3)',
                  transition: isSpeaking ? 'none' : 'text-shadow 0.3s ease-out'
                }}
              >
                {currentCompany?.name || "SKROBAKI"}
              </h1>
              <ChevronDown 
                className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" 
                style={{
                  filter: isSpeaking 
                    ? `drop-shadow(0 0 ${5 + getGlowIntensity() * 10}px rgba(59, 130, 246, ${getGlowIntensity()}))` 
                    : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                }}
              />
              
              {/* AI Status Indicator */}
              {isSpeaking && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400/30">
                    <div 
                      className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                      style={{ opacity: getGlowIntensity() }}
                    />
                    <span className="text-xs text-blue-200 font-medium body-modern">AI Speaking</span>
                  </div>
                </div>
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-[300px] mt-2" align="center">
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
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
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
                  onClick={() => switchCompany(company.id)}
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
              
              <DropdownMenuSeparator />
              
              {/* Company Actions */}
              <DropdownMenuItem 
                onClick={() => onNavigate('company-settings')}
                className="hover:bg-accent"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Company Settings</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setShowCreateDialog(true)}
                className="hover:bg-accent"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Company</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};