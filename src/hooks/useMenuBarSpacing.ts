

export const useMenuBarSpacing = (currentPage?: string) => {
  // Use dynamic CSS variable set by MenuBar to avoid gaps
  const getSpacingClasses = () => {
    if (currentPage === 'tasks') return '';
    return 'mt-[var(--header-height)]';
  };

  const getMinHeightClasses = () => {
    if (currentPage === 'tasks') return 'min-h-screen';
    return 'min-h-[calc(100vh-var(--header-height))]';
  };

  const getFullHeightClasses = () => {
    if (currentPage === 'tasks') return 'h-screen';
    return 'h-[calc(100vh-var(--header-height))]';
  };

  return {
    spacingClasses: getSpacingClasses(),
    minHeightClasses: getMinHeightClasses(),
    fullHeightClasses: getFullHeightClasses(),
    hasActiveTimer: true // Always true since bar is always visible
  };
};