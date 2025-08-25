import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'business_admin' | 'project_admin' | 'user' | 'client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRole(null);
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user roles for user:', user.id);
        
        // Batch all role checks in parallel instead of sequential calls
        const [
          { data: hasSuper, error: superError },
          { data: hasBusiness, error: businessError },
          { data: hasProject, error: projectError },
          { data: hasUser, error: userError },
          { data: hasClient, error: clientError }
        ] = await Promise.all([
          supabase.rpc('has_role_secure', { _user_id: user.id, _role: 'superadmin' }),
          supabase.rpc('has_role_secure', { _user_id: user.id, _role: 'business_admin' }),
          supabase.rpc('has_role_secure', { _user_id: user.id, _role: 'project_admin' }),
          supabase.rpc('has_role_secure', { _user_id: user.id, _role: 'user' }),
          supabase.rpc('has_role_secure', { _user_id: user.id, _role: 'client' })
        ]);

        if (superError || businessError || projectError || userError || clientError) {
          console.error('Error checking user roles:', { superError, businessError, projectError, userError, clientError });
          setRole('user');
          setRoles(['user']);
        } else {
          // Build roles array based on function results
          const userRoles: UserRole[] = [];
          if (hasSuper) userRoles.push('superadmin');
          if (hasBusiness) userRoles.push('business_admin');
          if (hasProject) userRoles.push('project_admin');
          if (hasUser) userRoles.push('user');
          if (hasClient) userRoles.push('client');
          
          console.log('User roles found:', userRoles);
          setRoles(userRoles);
          
          if (userRoles.length > 0) {
            // Set primary role (highest priority)
            const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
            const primaryRole = userRoles.reduce((highest, current) => 
              roleHierarchy[current] > roleHierarchy[highest] ? current : highest
            );
            console.log('Primary role set to:', primaryRole);
            setRole(primaryRole);
          } else {
            // No roles found, default to user
            console.log('No roles found, defaulting to user');
            setRole('user');
            setRoles(['user']);
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRole('user');
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const hasSpecificRole = (requiredRole: UserRole): boolean => {
    return roles.includes(requiredRole);
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.some(reqRole => roles.includes(reqRole));
  };

  const addRole = async (newRole: UserRole): Promise<boolean> => {
    if (!user || roles.includes(newRole)) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: newRole });

      if (!error) {
        setRoles(prev => [...prev, newRole]);
        // Update primary role if the new role has higher priority
        const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
        if (!role || roleHierarchy[newRole] > roleHierarchy[role]) {
          setRole(newRole);
        }
        return true;
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
    return false;
  };

  const removeRole = async (roleToRemove: UserRole): Promise<boolean> => {
    if (!user || !roles.includes(roleToRemove)) return false;

    // Prevent removing superadmin role
    if (roleToRemove === 'superadmin') {
      console.warn('Cannot remove superadmin role - it is locked for security reasons');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', roleToRemove);

      if (!error) {
        const newRoles = roles.filter(r => r !== roleToRemove);
        setRoles(newRoles);
        
        // Update primary role if we removed the current primary
        if (role === roleToRemove) {
          const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
          const newPrimaryRole = newRoles.length > 0 
            ? newRoles.reduce((highest, current) => 
                roleHierarchy[current] > roleHierarchy[highest] ? current : highest
              )
            : 'user';
          setRole(newPrimaryRole);
        }
        return true;
      }
    } catch (error) {
      console.error('Error removing role:', error);
    }
    return false;
  };

  const isSuperAdmin = () => roles.includes('superadmin');
  const isBusinessAdmin = () => roles.includes('business_admin') || roles.includes('superadmin');
  const isProjectAdmin = () => roles.includes('project_admin') || roles.includes('business_admin') || roles.includes('superadmin');
  const isUser = () => roles.includes('user') || roles.includes('project_admin') || roles.includes('business_admin') || roles.includes('superadmin');
  const isClient = () => roles.includes('client') || roles.length > 0;
  
  // Legacy methods for backwards compatibility
  const isPlatformAdmin = () => roles.includes('superadmin');
  const isCompanyAdmin = () => roles.includes('business_admin') || roles.includes('superadmin');

  return {
    role,
    roles,
    loading,
    hasRole,
    hasSpecificRole,
    hasAnyRole,
    addRole,
    removeRole,
    isSuperAdmin,
    isBusinessAdmin,
    isProjectAdmin,
    isUser,
    isClient,
    isPlatformAdmin,
    isCompanyAdmin
  };
};