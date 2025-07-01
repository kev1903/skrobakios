
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface UserContextType {
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const defaultUserProfile: UserProfile = {
  firstName: 'Wade',
  lastName: 'Warren',
  email: 'wade.warren@example.com',
  phone: '+1 (555) 123-4567',
  jobTitle: 'UI UX Designer',
  company: 'KAKSIK',
  location: 'San Francisco, CA',
  bio: 'Passionate UI/UX designer with 5+ years of experience creating user-centered digital experiences.',
  avatarUrl: '',
  birthDate: '1990-05-15',
  website: 'https://wade-warren.design',
  // Company Details
  companyName: 'KAKSIK Design Studio',
  abn: '12 345 678 901',
  companyWebsite: 'https://kaksik.design',
  companyAddress: '123 Design Street, San Francisco, CA 94105',
  companyMembers: '15',
  companyLogo: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile }}>
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
