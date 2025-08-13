

export const useMenuBarSpacing = (currentPage?: string) => {
  // Use dynamic CSS variable set by MenuBar to avoid gaps
  const getSpacingClasses = () => {
    // Special pages that handle their own header spacing
    if (currentPage === 'auth' || currentPage === 'landing') return '';
    return 'mt-[var(--header-height,64px)]';
  };

  const getMinHeightClasses = () => {
    if (currentPage === 'auth' || currentPage === 'landing') return 'min-h-screen';
    return 'min-h-[calc(100vh-var(--header-height,64px))]';
  };

  const getFullHeightClasses = () => {
    if (currentPage === 'auth' || currentPage === 'landing') return 'h-screen';
    return 'h-[calc(100vh-var(--header-height,64px))]';
  };

  return {
    spacingClasses: getSpacingClasses(),
    minHeightClasses: getMinHeightClasses(),
    fullHeightClasses: getFullHeightClasses(),
    hasActiveTimer: true // Always true since bar is always visible
  };
};