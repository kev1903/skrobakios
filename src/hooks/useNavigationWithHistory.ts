import { useCallback } from 'react';

interface NavigationWithHistoryProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const useNavigationWithHistory = ({ onNavigate, currentPage }: NavigationWithHistoryProps) => {
  
  // Navigate to a specific page (normal navigation)
  const navigateTo = useCallback((page: string) => {
    onNavigate(page);
  }, [onNavigate]);

  // Navigate back or to a sensible default based on current page context
  const navigateBack = useCallback(() => {
    // Define logical "parent" pages for different sections
    const pageHierarchy: Record<string, string> = {
      // Business management flows
      'create-business': 'business',
      'business-settings': 'business',
      
      // Project flows
      'create-project': 'projects',
      'project-detail': 'projects',
      'project-team': 'project-detail',
      'project-settings': 'project-detail',
      
      // Estimate flows
      'estimate-creation': 'estimates',
      
      // Finance flows
      'bills': 'finance',
      'cash-flow': 'finance',
      'invoices': 'finance',
      
      // Task flows
      'my-tasks': 'home',
      'milestones': 'project-detail',
      
      // QA/QC flows - preserve project ID when going back
      'qaqc-issue-detail': 'qaqc-issues',
       
      // Settings flows
      'platform-dashboard': 'home',
      
      // Default fallbacks
      'home': 'landing',
      'dashboard': 'home'
    };

    const parentPage = pageHierarchy[currentPage];
    if (parentPage) {
      // For QA/QC pages, preserve the project ID and return to Issues list
      if (currentPage.startsWith('qaqc-') && (parentPage === 'project-qaqc' || parentPage === 'qaqc-issues')) {
        // Extract projectId from top-level URL or from the page param
        const urlParams = new URLSearchParams(window.location.search);
        let projectId = urlParams.get('projectId');
        if (!projectId) {
          const pageParam = urlParams.get('page') || '';
          const idx = pageParam.indexOf('?');
          if (idx !== -1) {
            const innerParams = new URLSearchParams(pageParam.slice(idx + 1));
            projectId = innerParams.get('projectId');
          }
        }
        if (projectId) {
          onNavigate(`${parentPage}?projectId=${projectId}`);
        } else {
          onNavigate(parentPage);
        }
      } else {
        onNavigate(parentPage);
      }
    } else {
      // Fallback to home or landing based on context
      if (currentPage === 'landing' || currentPage === 'auth') {
        // Already at top level, stay here
        return;
      } else {
        // Default to home for most pages
        onNavigate('home');
      }
    }
  }, [onNavigate, currentPage]);

  // Navigate after successful action - uses intelligent back navigation
  const navigateAfterSuccess = useCallback((successMessage?: string) => {
    navigateBack();
  }, [navigateBack]);

  return {
    navigateTo,
    navigateBack,
    navigateAfterSuccess
  };
};