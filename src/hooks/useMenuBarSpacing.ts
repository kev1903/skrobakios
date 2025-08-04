import { useTimeTracking } from '@/contexts/TimeTrackingContext';

export const useMenuBarSpacing = (currentPage?: string) => {
  // For tasks page, don't apply any spacing since it's handled as full screen
  const getSpacingClasses = () => {
    if (currentPage === 'tasks') {
      return '';
    }
    return 'pt-[73px]';
  };

  const getMinHeightClasses = () => {
    if (currentPage === 'tasks') {
      return 'min-h-screen';
    }
    return 'min-h-[calc(100vh-73px)]';
  };

  const getFullHeightClasses = () => {
    if (currentPage === 'tasks') {
      return 'h-screen';
    }
    return 'h-[calc(100vh-73px)]';
  };

  return {
    spacingClasses: getSpacingClasses(),
    minHeightClasses: getMinHeightClasses(),
    fullHeightClasses: getFullHeightClasses(),
    hasActiveTimer: true // Always true since bar is always visible
  };
};