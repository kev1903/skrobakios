import React, { useState } from 'react';
import { TopFloatingBar } from './home/TopFloatingBar';
import { NavigationRibbon } from './home/NavigationRibbon';
import { SidePageOverlay } from './home/SidePageOverlay';
import { FullScreenSchedule } from './home/FullScreenSchedule';
import { ProjectsFullScreen } from './home/ProjectsFullScreen';
import { OverlayManager } from './home/OverlayManager';

interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const HomeFloatingBar = ({
  onNavigate,
  onSelectProject
}: HomeFloatingBarProps) => {
  const [isRibbonOpen, setIsRibbonOpen] = useState(false);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false);
  const [sidePageContent, setSidePageContent] = useState<string | null>(null);
  const [isHomeHovered, setIsHomeHovered] = useState(false);
  const [isScheduleFullScreen, setIsScheduleFullScreen] = useState(false);

  const toggleRibbon = () => {
    if (!isRibbonOpen) {
      onNavigate('home');
      setIsRibbonOpen(true);
      setSidePageContent(null);
    } else {
      setIsRibbonOpen(false);
      setSidePageContent(null);
    }
  };

  const handleSidePageSelect = (page: string) => {
    setSidePageContent(page);
    setIsProjectSectionOpen(false);
  };

  const handleOpenSchedule = () => {
    setIsScheduleFullScreen(true);
    setIsRibbonOpen(false);
    setSidePageContent(null);
    setIsHomeHovered(false);
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
        isHomeHovered={isHomeHovered}
        setIsHomeHovered={setIsHomeHovered}
        onToggleRibbon={toggleRibbon}
        onNavigate={onNavigate}
        onOpenSchedule={handleOpenSchedule}
      />

      <NavigationRibbon
        isOpen={isRibbonOpen}
        onSidePageSelect={handleSidePageSelect}
        onNavigate={onNavigate}
        onClose={handleCloseRibbon}
      />

      <SidePageOverlay
        isRibbonOpen={isRibbonOpen}
        sidePageContent={sidePageContent}
        onNavigate={onNavigate}
        onSelectProject={onSelectProject}
        onCloseSidePage={handleCloseSidePage}
      />

      <FullScreenSchedule
        isOpen={isScheduleFullScreen}
        onNavigate={onNavigate}
        onClose={() => setIsScheduleFullScreen(false)}
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