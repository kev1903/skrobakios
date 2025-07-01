
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  company: string;
  location: string;
  bio: string;
  avatar_url: string;
  birth_date: string;
  website: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          job_title: data.job_title || '',
          company: data.company || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          birth_date: data.birth_date || '',
          website: data.website || '',
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: ProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save profile data",
          variant: "destructive",
        });
        return false;
      }

      // Convert empty birth_date to null for database storage
      const birthDateValue = profileData.birth_date && profileData.birth_date.trim() !== '' 
        ? profileData.birth_date 
        : null;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone,
          job_title: profileData.job_title,
          company: profileData.company,
          location: profileData.location,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          birth_date: birthDateValue,
          website: profileData.website,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile data",
          variant: "destructive",
        });
        return false;
      }

      setProfile(profileData);
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error in saveProfile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    saveProfile,
    refetchProfile: fetchProfile,
  };
};
