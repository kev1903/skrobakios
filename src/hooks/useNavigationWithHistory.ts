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
      'qaqc-issue-detail': 'project-qaqc',
      
      // Settings flows
      'platform-dashboard': 'home',
      
      // Default fallbacks
      'home': 'landing',
      'dashboard': 'home'
    };

    const parentPage = pageHierarchy[currentPage];
    if (parentPage) {
      // For QA/QC pages, preserve the project ID
      if (currentPage.startsWith('qaqc-') && parentPage === 'project-qaqc') {
        // Extract projectId from current URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');
        if (projectId) {
          onNavigate(`${parentPage}&projectId=${projectId}`);
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