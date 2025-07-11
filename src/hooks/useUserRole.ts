import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'owner' | 'admin' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const roleHierarchy = { superadmin: 4, owner: 3, admin: 2, user: 1 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const isSuperAdmin = () => role === 'superadmin';
  const isOwner = () => role === 'owner' || role === 'superadmin';
  const isAdmin = () => role === 'admin' || role === 'owner' || role === 'superadmin';

  return {
    role,
    loading,
    hasRole,
    isSuperAdmin,
    isOwner,
    isAdmin
  };
};