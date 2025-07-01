
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
  company_slogan: string;
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
          company_slogan: data.company_slogan || '',
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

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
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
            company: profileData.company,
            location: profileData.location,
            bio: profileData.bio,
            avatar_url: profileData.avatar_url,
            birth_date: birthDateValue,
            website: profileData.website,
            company_slogan: profileData.company_slogan,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert({
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
            company_slogan: profileData.company_slogan,
          });
      }

      if (result.error) {
        console.error('Error saving profile:', result.error);
        toast({
          title: "Error",
          description: "Failed to save profile data",
          variant: "destructive",
        });
        return false;
      }

      // Update local state immediately for instant UI feedback
      setProfile(profileData);
      
      // Also trigger a refetch to ensure we have the latest data from the database
      // This will also trigger real-time updates for other components
      await fetchProfile();
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

    // Set up real-time subscription for profile updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            // Refetch profile data when changes occur
            fetchProfile();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = setupRealtimeSubscription();

    return () => {
      unsubscribe?.then(cleanup => cleanup?.());
    };
  }, []);

  return {
    profile,
    loading,
    saveProfile,
    refetchProfile: fetchProfile,
  };
};
