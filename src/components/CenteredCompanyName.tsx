import React, { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateCompanyDialog } from './CreateCompanyDialog';
import { AISpeakingEffects } from './company/AISpeakingEffects';
import { CompanyDropdownContent } from './company/CompanyDropdownContent';
import { useAISpeakingEffects } from './company/useAISpeakingEffects';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { currentCompany, companies, switchCompany, loading, refreshCompanies } = useCompany();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { pulseIntensity, getGlowIntensity, getScaleIntensity } = useAISpeakingEffects(isSpeaking);

  // Refresh companies periodically to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCompanies();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshCompanies]);

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
            <AISpeakingEffects 
              isSpeaking={isSpeaking}
              pulseIntensity={pulseIntensity}
              getGlowIntensity={getGlowIntensity}
            />

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
        
        <CompanyDropdownContent
          companies={companies}
          currentCompany={currentCompany}
          loading={loading}
          onSwitchCompany={switchCompany}
          onCreateCompany={() => setShowCreateDialog(true)}
        />
      </DropdownMenu>

      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};