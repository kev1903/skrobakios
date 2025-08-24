import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  location: string;
  bio: string;
  avatar_url: string;
  birth_date: string;
  website: string;
  company_slogan: string;
}

export const useAdminProfile = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string): Promise<ProfileData | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive",
        });
        return null;
      }

      if (data) {
        return {
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          job_title: data.job_title || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          birth_date: data.birth_date || '',
          website: data.website || '',
          company_slogan: data.company_slogan || '',
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async (userId: string, profileData: ProfileData): Promise<boolean> => {
    try {
      setLoading(true);

      // Convert empty birth_date to null for database storage
      const birthDateValue = profileData.birth_date && profileData.birth_date.trim() !== '' 
        ? profileData.birth_date 
        : null;

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            phone: profileData.phone,
            job_title: profileData.job_title,
            location: profileData.location,
            bio: profileData.bio,
            avatar_url: profileData.avatar_url,
            birth_date: birthDateValue,
            website: profileData.website,
            company_slogan: profileData.company_slogan,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            phone: profileData.phone,
            job_title: profileData.job_title,
            location: profileData.location,
            bio: profileData.bio,
            avatar_url: profileData.avatar_url,
            birth_date: birthDateValue,
            website: profileData.website,
            company_slogan: profileData.company_slogan,
          });
      }

      if (result.error) {
        console.error('Error saving user profile:', result.error);
        toast({
          title: "Error",
          description: "Failed to save user profile",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "User profile updated successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error in saveUserProfile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchUserProfile,
    saveUserProfile,
  };
};