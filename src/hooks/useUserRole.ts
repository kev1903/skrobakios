import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'owner' | 'admin' | 'user';

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
        // Fetch all roles for the user
        const { data: rolesData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role');

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user roles:', error);
          setRole('user'); 
          setRoles(['user']);
        } else if (rolesData && rolesData.length > 0) {
          const userRoles = rolesData.map(r => r.role as UserRole);
          setRoles(userRoles);
          
          // Set primary role (highest priority)
          const roleHierarchy = { superadmin: 4, owner: 3, admin: 2, user: 1 };
          const primaryRole = userRoles.reduce((highest, current) => 
            roleHierarchy[current] > roleHierarchy[highest] ? current : highest
          );
          setRole(primaryRole);
        } else {
          // No roles found, default to user
          setRole('user');
          setRoles(['user']);
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
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const roleHierarchy = { superadmin: 4, owner: 3, admin: 2, user: 1 };
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
        const roleHierarchy = { superadmin: 4, owner: 3, admin: 2, user: 1 };
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
          const roleHierarchy = { superadmin: 4, owner: 3, admin: 2, user: 1 };
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
  const isOwner = () => roles.includes('owner') || roles.includes('superadmin');
  const isAdmin = () => roles.includes('admin') || roles.includes('owner') || roles.includes('superadmin');

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
    isOwner,
    isAdmin
  };
};