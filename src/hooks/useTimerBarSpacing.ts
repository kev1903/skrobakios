import { useTimeTracking } from '@/contexts/TimeTrackingContext';

export const useTimerBarSpacing = () => {
  const { activeTimer } = useTimeTracking();
  
  // Return appropriate classes based on whether timer is active
  const getSpacingClasses = () => {
    return activeTimer ? 'pt-[73px]' : '';
  };

  const getMinHeightClasses = () => {
    return activeTimer ? 'min-h-[calc(100vh-73px)]' : 'min-h-screen';
  };

  const getFullHeightClasses = () => {
    return activeTimer ? 'h-[calc(100vh-73px)]' : 'h-screen';
  };

  return {
    spacingClasses: getSpacingClasses(),
    minHeightClasses: getMinHeightClasses(),
    fullHeightClasses: getFullHeightClasses(),
    hasActiveTimer: !!activeTimer
  };
};