import React, { useState, useEffect } from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
  hideOnDeny?: boolean;
}

interface RequirePermProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null,
  hideOnDeny = false
}) => {
  const { activeBusinessId } = useActiveBusiness();
  const { hasPermission, loading } = useUserPermissions(activeBusinessId || undefined);

  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>;
  }

  const hasAccess = hasPermission(permission);

  if (!hasAccess) {
    if (hideOnDeny) return null;
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const RequirePerm: React.FC<RequirePermProps> = ({
  children,
  permission,
  fallback = null
}) => {
  return (
    <PermissionGuard permission={permission} fallback={fallback} hideOnDeny={false}>
      {children}
    </PermissionGuard>
  );
};

// Hook for programmatic permission checking
export const usePermissionCheck = (permission: string) => {
  const { activeBusinessId } = useActiveBusiness();
  const { hasPermission, loading } = useUserPermissions(activeBusinessId || undefined);

  return {
    can: hasPermission(permission),
    loading
  };
};

// Async permission helper function
export const can = async (permission: string): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const activeBusinessId = localStorage.getItem('activeBusinessId');
    if (!activeBusinessId) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const hasPermission = await supabase.rpc('user_has_permission', {
      target_user_id: user.id,
      target_company_id: activeBusinessId,
      permission_key_param: permission
    });

    return hasPermission.data || false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

export const requirePerm = async (permission: string): Promise<void> => {
  const hasAccess = await can(permission);
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }
};