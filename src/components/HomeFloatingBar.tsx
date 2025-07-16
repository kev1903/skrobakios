import React, { useState } from 'react';
import { TopFloatingBar } from './home/TopFloatingBar';
import { NavigationRibbon } from './home/NavigationRibbon';
import { SidePageOverlay } from './home/SidePageOverlay';

import { ProjectsFullScreen } from './home/ProjectsFullScreen';
import { OverlayManager } from './home/OverlayManager';
import { useAppContext } from '@/contexts/AppContextProvider';

interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
  showSaveButton: boolean;
  onSaveMapPosition: () => Promise<void>;
  currentPage?: string;
}

export const HomeFloatingBar = ({
  onNavigate,
  onSelectProject,
  showSaveButton,
  onSaveMapPosition,
  currentPage = ""
}: HomeFloatingBarProps) => {
  const { activeContext, getContextRoute } = useAppContext();
  const [isRibbonOpen, setIsRibbonOpen] = useState(false);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false);
  const [sidePageContent, setSidePageContent] = useState<string | null>(null);
  

  const toggleRibbon = () => {
    // Simply toggle the ribbon open/closed state without navigation
    setIsRibbonOpen(!isRibbonOpen);
    if (isRibbonOpen) {
      setSidePageContent(null);
    }
  };

  const handleSidePageSelect = (page: string) => {
    setSidePageContent(page);
    setIsProjectSectionOpen(false);
  };

  const handleNavigateFromRibbon = (page: string) => {
    // Handle navigation from ribbon - don't close ribbon for context switches
    if (page === 'personal-dashboard' || page === 'home') {
      // These are context switches - keep ribbon open
      onNavigate(page);
    } else {
      // Other navigation - close ribbon
      onNavigate(page);
      setIsRibbonOpen(false);
      setSidePageContent(null);
    }
  };


  const handleCloseRibbon = () => {
    setIsRibbonOpen(false);
    setSidePageContent(null);
  };

  const handleCloseSidePage = () => {
    setSidePageContent(null);
  };

  return (
    <>
      <TopFloatingBar
        onToggleRibbon={toggleRibbon}
        onNavigate={onNavigate}
        showSaveButton={showSaveButton}
        onSaveMapPosition={onSaveMapPosition}
      />

      <NavigationRibbon
        isOpen={isRibbonOpen}
        onSidePageSelect={handleSidePageSelect}
        onNavigate={handleNavigateFromRibbon}
        onClose={handleCloseRibbon}
        currentPage={currentPage}
      />

      <SidePageOverlay
        isRibbonOpen={isRibbonOpen}
        sidePageContent={sidePageContent}
        onNavigate={onNavigate}
        onSelectProject={onSelectProject}
        onCloseSidePage={handleCloseSidePage}
      />


      <ProjectsFullScreen
        isOpen={isProjectSectionOpen}
        onNavigate={onNavigate}
        onClose={() => setIsProjectSectionOpen(false)}
      />

      <OverlayManager
        isRibbonOpen={isRibbonOpen}
        sidePageContent={sidePageContent}
        onCloseRibbon={handleCloseRibbon}
      />
    </>
  );
};