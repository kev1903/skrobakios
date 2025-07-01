
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string;
  birthDate: string;
  website: string;
  // Company Details
  companyName: string;
  abn: string;
  companyWebsite: string;
  companyAddress: string;
  companyMembers: string;
  companyLogo: string;
  companySlogan: string;
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
  company: '',
  location: '',
  bio: '',
  avatarUrl: '',
  birthDate: '',
  website: '',
  // Company Details
  companyName: '',
  abn: '',
  companyWebsite: '',
  companyAddress: '',
  companyMembers: '',
  companyLogo: '',
  companySlogan: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const { profile, loading } = useProfile();

  // Sync profile data when it loads from the database
  useEffect(() => {
    if (profile) {
      setUserProfile({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || '',
        company: profile.company || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
        birthDate: profile.birth_date || '',
        website: profile.website || '',
        // Company Details - using defaults for now
        companyName: profile.company || '',
        abn: '',
        companyWebsite: '',
        companyAddress: '',
        companyMembers: '',
        companyLogo: '',
        companySlogan: profile.company_slogan || '',
      });
    }
  }, [profile]);

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
