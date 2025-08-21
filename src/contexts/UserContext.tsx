
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  location: string;
  bio: string;
  avatarUrl: string;
  birthDate: string;
  website: string;
  qualifications: string[];
  licenses: string[];
  awards: string[];
}

interface UserContextType {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  loading: boolean;
}

const defaultUserProfile: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  location: '',
  bio: '',
  avatarUrl: '',
  birthDate: '',
  website: '',
  qualifications: [],
  licenses: [],
  awards: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const { profile, loading, refetchProfile } = useProfile();

  // Sync profile data when it loads from the database
  useEffect(() => {
    if (profile) {
      setUserProfile({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
        birthDate: profile.birth_date || '',
        website: profile.website || '',
        qualifications: profile.qualifications || [],
        licenses: profile.licenses || [],
        awards: profile.awards || [],
      });
    }
  }, [profile]);

  // Fallback to auth user info if profile is missing or incomplete
  useEffect(() => {
    let cancelled = false;

    const loadAuthUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        setUserProfile(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          firstName: prev.firstName || (user.user_metadata as any)?.first_name || '',
          lastName: prev.lastName || (user.user_metadata as any)?.last_name || '',
          avatarUrl: prev.avatarUrl || (user.user_metadata as any)?.avatar_url || '',
        }));
      } catch (e) {
        console.error('Failed to load auth user for UserContext fallback', e);
      }
    };

    loadAuthUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) return;
      setUserProfile(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: (user.user_metadata as any)?.first_name || prev.firstName,
        lastName: (user.user_metadata as any)?.last_name || prev.lastName,
        avatarUrl: (user.user_metadata as any)?.avatar_url || prev.avatarUrl,
      }));
    });

    return () => {
      cancelled = true;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Listen for company changes and refresh profile
  useEffect(() => {
    const handleCompanyChanged = () => {
      console.log('👤 Company changed - refreshing user profile');
      refetchProfile();
    };

    window.addEventListener('companyChanged', handleCompanyChanged);
    return () => window.removeEventListener('companyChanged', handleCompanyChanged);
  }, [refetchProfile]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
