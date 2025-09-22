import React, { useEffect } from 'react';
import { useModulePermission } from '@/components/ModuleWrapper';
import { AlertTriangle, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReadOnlyWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  subModuleId: string;
  companyId: string;
  showBanner?: boolean;
  customBannerMessage?: string;
}

/**
 * ReadOnlyWrapper component that disables edit functionality when user has view-only access
 * 
 * This component:
 * 1. Checks the user's permission level for the module/submodule
 * 2. If user has "can_view" access, it adds CSS classes to disable editing
 * 3. Shows an optional banner indicating read-only mode
 * 4. Applies pointer-events: none to buttons, forms, and input elements
 */
export const ReadOnlyWrapper: React.FC<ReadOnlyWrapperProps> = ({
  children,
  moduleId,
  subModuleId,
  companyId,
  showBanner = true,
  customBannerMessage
}) => {
  const { accessLevel, canEdit, loading } = useModulePermission({
    moduleId,
    subModuleId,
    companyId
  });

  const isReadOnly = accessLevel === 'can_view' && !canEdit;

  // Apply read-only styles to document when in read-only mode
  useEffect(() => {
    if (isReadOnly) {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerHTML = `
        .read-only-content button:not([data-allow-readonly]),
        .read-only-content input:not([data-allow-readonly]),
        .read-only-content textarea:not([data-allow-readonly]),
        .read-only-content select:not([data-allow-readonly]),
        .read-only-content [role="button"]:not([data-allow-readonly]),
        .read-only-content [contenteditable="true"]:not([data-allow-readonly]) {
          pointer-events: none !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        
        .read-only-content form:not([data-allow-readonly]) {
          pointer-events: none !important;
          opacity: 0.8 !important;
        }
        
        .read-only-content [data-edit-action]:not([data-allow-readonly]),
        .read-only-content [data-delete-action]:not([data-allow-readonly]),
        .read-only-content [data-create-action]:not([data-allow-readonly]) {
          display: none !important;
        }
        
        /* Allow certain navigation and view actions */
        .read-only-content a:not([data-block-readonly]),
        .read-only-content button[data-view-action],
        .read-only-content button[data-navigation-action],
        .read-only-content [data-allow-readonly] {
          pointer-events: auto !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(styleSheet);
      
      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, [isReadOnly]);

  if (loading) {
    return <div className="animate-pulse bg-muted rounded h-8 w-full" />;
  }

  return (
    <div className={isReadOnly ? 'read-only-mode' : ''}>
      {/* Read-only banner */}
      {isReadOnly && showBanner && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/50">
          <Eye className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {customBannerMessage || "You have view-only access to this module. Editing is disabled."}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Content wrapper with conditional read-only styling */}
      <div className={isReadOnly ? 'read-only-content' : ''}>
        {children}
      </div>
    </div>
  );
};

/**
 * Hook to check if current context is in read-only mode
 */
interface UseReadOnlyProps {
  moduleId: string;
  subModuleId: string;
  companyId: string;
}

export const useReadOnly = ({ moduleId, subModuleId, companyId }: UseReadOnlyProps) => {
  const { accessLevel, canEdit, loading } = useModulePermission({
    moduleId,
    subModuleId,
    companyId
  });

  return {
    isReadOnly: accessLevel === 'can_view' && !canEdit,
    accessLevel,
    canEdit,
    loading
  };
};

/**
 * Higher-order component for wrapping entire pages in read-only mode
 */
interface WithReadOnlyProps {
  moduleId: string;
  subModuleId: string;
  companyId: string;
  showBanner?: boolean;
  customBannerMessage?: string;
}

export const withReadOnly = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { moduleId, subModuleId, companyId, showBanner = true, customBannerMessage }: WithReadOnlyProps
) => {
  const WithReadOnlyComponent: React.FC<P> = (props) => {
    return (
      <ReadOnlyWrapper
        moduleId={moduleId}
        subModuleId={subModuleId}
        companyId={companyId}
        showBanner={showBanner}
        customBannerMessage={customBannerMessage}
      >
        <WrappedComponent {...props} />
      </ReadOnlyWrapper>
    );
  };

  WithReadOnlyComponent.displayName = `withReadOnly(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithReadOnlyComponent;
};