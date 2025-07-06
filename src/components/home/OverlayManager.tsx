import React from 'react';

interface OverlayManagerProps {
  isRibbonOpen: boolean;
  sidePageContent: string | null;
  onCloseRibbon: () => void;
}

export const OverlayManager = ({
  isRibbonOpen,
  sidePageContent,
  onCloseRibbon
}: OverlayManagerProps) => {
  // Only show overlay when ribbon is open but no side content
  if (!isRibbonOpen || sidePageContent) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 z-30"
      onClick={onCloseRibbon}
    />
  );
};