import { useTimeTracking } from '@/contexts/TimeTrackingContext';

export const useMenuBarSpacing = () => {
  // MenuBar is now always visible, so always apply spacing
  const getSpacingClasses = () => {
    return 'pt-[73px]';
  };

  const getMinHeightClasses = () => {
    return 'min-h-[calc(100vh-73px)]';
  };

  const getFullHeightClasses = () => {
    return 'h-[calc(100vh-73px)]';
  };

  return {
    spacingClasses: getSpacingClasses(),
    minHeightClasses: getMinHeightClasses(),
    fullHeightClasses: getFullHeightClasses(),
    hasActiveTimer: true // Always true since bar is always visible
  };
};