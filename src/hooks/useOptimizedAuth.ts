import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Cache for user data to prevent redundant API calls
const userDataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useOptimizedAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    if (!userId || authLoading) {
      setLoading(false);
      return;
    }

    const fetchAllUserData = async () => {
      try {
        // Check cache first
        const cacheKey = `user_data_${userId}`;
        const cachedData = userDataCache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
          console.log('📦 Using cached user data');
          setProfile(cachedData.profile);
          setRoles(cachedData.roles);
          setCompanies(cachedData.companies);
          setLoading(false);
          return;
        }

        console.log('🚀 Fetching optimized user data in parallel...');
        
        // Fetch all user data in parallel for maximum performance
        const [
          profileResult,
          rolesResult,
          companiesResult
        ] = await Promise.all([
          // Profile data (separate from company query to avoid join issues)
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          
          // All roles in parallel
          Promise.all([
            supabase.rpc('has_role_secure', { _user_id: userId, _role: 'superadmin' }),
            supabase.rpc('has_role_secure', { _user_id: userId, _role: 'business_admin' }),
            supabase.rpc('has_role_secure', { _user_id: userId, _role: 'project_admin' }),
            supabase.rpc('has_role_secure', { _user_id: userId, _role: 'user' }),
            supabase.rpc('has_role_secure', { _user_id: userId, _role: 'client' })
          ]),
          
          // Companies via RPC
          supabase.rpc('get_user_companies', { target_user_id: userId })
        ]);

        // Get active company data separately if needed
        let activeCompanyName = '';
        if (companiesResult.data && companiesResult.data.length > 0) {
          const activeCompany = companiesResult.data.find(c => c.status === 'active') || companiesResult.data[0];
          activeCompanyName = activeCompany.name || '';
        }

        // Process profile data
        let profileData = null;
        if (profileResult.data) {
          profileData = {
            ...profileResult.data,
            company: activeCompanyName || profileResult.data.company || ''
          };
        }

        // Process roles data
        const [superResult, businessResult, projectResult, userResult, clientResult] = rolesResult;
        const userRoles = [];
        if (superResult.data) userRoles.push('superadmin');
        if (businessResult.data) userRoles.push('business_admin');
        if (projectResult.data) userRoles.push('project_admin');
        if (userResult.data) userRoles.push('user');
        if (clientResult.data) userRoles.push('client');

        // Process companies data
        const companiesData = companiesResult.data || [];

        // Cache the results
        userDataCache.set(cacheKey, {
          profile: profileData,
          roles: userRoles,
          companies: companiesData,
          timestamp: Date.now()
        });

        console.log('✅ Optimized user data loaded successfully');
        setProfile(profileData);
        setRoles(userRoles);
        setCompanies(companiesData);
        
      } catch (error) {
        console.error('❌ Error fetching optimized user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
  }, [userId, authLoading]);

  // Clear cache when user changes
  useEffect(() => {
    if (!userId) {
      userDataCache.clear();
    }
  }, [userId]);

  return {
    profile,
    roles,
    companies,
    loading: loading || authLoading,
    refetch: () => {
      if (userId) {
        userDataCache.delete(`user_data_${userId}`);
        setLoading(true);
      }
    }
  };
};