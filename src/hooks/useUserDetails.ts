import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserDetails {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'team_member' | 'viewer' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client';
}

interface UseUserDetailsReturn {
  userData: UserDetails | null;
  loading: boolean;
  error: string | null;
}

// Cache to prevent duplicate requests
const userDetailsCache = new Map<string, { data: UserDetails | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserDetails = (userId: string, companyId: string): UseUserDetailsReturn => {
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !companyId) {
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      const cacheKey = `${userId}-${companyId}`;
      const cached = userDetailsCache.get(cacheKey);
      
      // Check if we have valid cached data
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setUserData(cached.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use separate queries for better type safety and performance
        const [membershipResult, profileResult] = await Promise.all([
          supabase
            .from('company_members')
            .select('role')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .single(),
          supabase
            .from('profiles')
            .select('user_id, email, first_name, last_name, avatar_url')
            .eq('user_id', userId)
            .single()
        ]);

        if (membershipResult.error) {
          console.error('Error fetching membership:', membershipResult.error);
          setError('User is not a member of this company');
          return;
        }

        if (profileResult.error) {
          console.error('Error fetching profile:', profileResult.error);
          setError('User profile not found');
          return;
        }

        const profile = profileResult.data;
        const membership = membershipResult.data;
        const user: UserDetails = {
          id: profile.user_id,
          email: profile.email || 'No email provided',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
          avatar: profile.avatar_url || undefined,
          role: membership.role as UserDetails['role']
        };

        // Cache the result
        userDetailsCache.set(cacheKey, { data: user, timestamp: Date.now() });
        setUserData(user);
        
      } catch (err) {
        console.error('Error in fetchUserDetails:', err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, companyId]);

  return { userData, loading, error };
};