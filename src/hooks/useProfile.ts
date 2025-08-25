
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
  qualifications: string[];
  licenses: string[];
  awards: string[];
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

      // Fetch profile and company data in parallel for better performance
      const [
        { data, error },
        { data: activeCompany, error: companyError }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('company_members')
          .select(`
            companies (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()
      ]);

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        });
        return;
      }

      if (companyError) {
        console.warn('Error fetching active company:', companyError);
      }

      if (data) {

        const currentCompanyName = activeCompany?.companies?.name || data.company || '';

        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          job_title: data.job_title || '',
          company: currentCompanyName,
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          birth_date: data.birth_date || '',
          website: data.website || '',
          company_slogan: data.company_slogan || '',
          qualifications: data.qualifications || [],
          licenses: data.licenses || [],
          awards: data.awards || [],
        });

        // Update the profile's company field if it differs from active company
        if (currentCompanyName && currentCompanyName !== data.company) {
          await supabase
            .from('profiles')
            .update({ company: currentCompanyName })
            .eq('user_id', user.id);
        }
      } else {
        // No profile found - create a minimal default profile for this user
        // We already have the activeCompany data from the parallel fetch above
        const defaultCompanyName = activeCompany?.companies?.name 
          || (user.user_metadata as any)?.company 
          || '';

        const defaultProfileInsert = {
          user_id: user.id,
          first_name: (user.user_metadata as any)?.first_name || '',
          last_name: (user.user_metadata as any)?.last_name || '',
          email: user.email || '',
          phone: '',
          job_title: '',
          company: defaultCompanyName,
          location: '',
          bio: '',
          avatar_url: (user.user_metadata as any)?.avatar_url || '',
          birth_date: null as any,
          website: '',
          company_slogan: ''
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfileInsert);

        if (insertError) {
          console.error('Error creating default profile:', insertError);
        }

        setProfile({
          first_name: defaultProfileInsert.first_name,
          last_name: defaultProfileInsert.last_name,
          email: defaultProfileInsert.email,
          phone: '',
          job_title: '',
          company: defaultCompanyName,
          location: '',
          bio: '',
          avatar_url: defaultProfileInsert.avatar_url || '',
          birth_date: '',
          website: '',
          company_slogan: '',
          qualifications: [],
          licenses: [],
          awards: [],
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
