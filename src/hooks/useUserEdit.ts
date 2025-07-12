import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useUserRole } from '@/hooks/useUserRole';

export const useUserEdit = () => {
  const { toast } = useToast();
  const { userProfile, updateUserProfile } = useUser();
  const { profile, loading, saveProfile } = useProfile();
  const { currentCompany } = useCompany();
  const { updateCompany, getCompany } = useCompanies();
  const { isSuperAdmin } = useUserRole();
  
  const [fullCompany, setFullCompany] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
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
    // Company Details - now from company context
    companyName: fullCompany?.name || currentCompany?.name || '',
    abn: fullCompany?.abn || '',
    companyWebsite: fullCompany?.website || '',
    companyAddress: fullCompany?.address || '',
    companyMembers: '',
    companyLogo: fullCompany?.logo_url || currentCompany?.logo_url || '',
    companySlogan: fullCompany?.slogan || ''
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !loading) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.job_title,
        location: profile.location,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        website: profile.website,
        companySlogan: profile.company_slogan || ''
      }));
    } else if (!loading && !profile) {
      // If no profile exists, use context data as fallback
      setProfileData(prev => ({
        ...prev,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        jobTitle: userProfile.jobTitle,
        location: userProfile.location,
        bio: userProfile.bio,
        avatarUrl: userProfile.avatarUrl,
        birthDate: userProfile.birthDate,
        website: userProfile.website
      }));
    }
  }, [profile, loading, userProfile]);

  // Fetch full company details when currentCompany changes - only for initial load
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (currentCompany?.id && !fullCompany) {
        try {
          const company = await getCompany(currentCompany.id);
          setFullCompany(company);
          
          // Update form data with company details
          setProfileData(prev => ({
            ...prev,
            companyName: company?.name || '',
            abn: company?.abn || '',
            companyWebsite: company?.website || '',
            companyAddress: company?.address || '',
            companyLogo: company?.logo_url || '',
            companySlogan: company?.slogan || ''
          }));
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
      }
    };
    
    fetchCompanyDetails();
  }, [currentCompany?.id, getCompany]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save profile to database
      const success = await saveProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        job_title: profileData.jobTitle,
        location: profileData.location,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        birth_date: profileData.birthDate,
        website: profileData.website,
        company_slogan: profileData.companySlogan,
        company: profileData.companyName
      });

      // If superadmin and currentCompany exists, also update company data
      if (isSuperAdmin() && currentCompany?.id && success) {
        try {
          console.log('Updating company as superadmin:', currentCompany.id, {
            name: profileData.companyName,
            abn: profileData.abn,
            website: profileData.companyWebsite,
            address: profileData.companyAddress,
            logo_url: profileData.companyLogo,
            slogan: profileData.companySlogan
          });
          
          const updatedCompany = await updateCompany(currentCompany.id, {
            name: profileData.companyName,
            abn: profileData.abn,
            website: profileData.companyWebsite,
            address: profileData.companyAddress,
            logo_url: profileData.companyLogo,
            slogan: profileData.companySlogan
          });
          
          if (updatedCompany) {
            console.log('Company updated successfully:', updatedCompany);
            // Update the fullCompany state immediately
            setFullCompany(updatedCompany);
            
            // Update the form data to match what was saved
            setProfileData(prev => ({
              ...prev,
              companyName: updatedCompany.name || '',
              abn: updatedCompany.abn || '',
              companyWebsite: updatedCompany.website || '',
              companyAddress: updatedCompany.address || '',
              companyLogo: updatedCompany.logo_url || '',
              companySlogan: updatedCompany.slogan || ''
            }));
          }
        } catch (companyError) {
          console.error('Error updating company:', companyError);
          toast({
            title: "Warning",
            description: "Profile saved but company update failed",
            variant: "destructive"
          });
          return;
        }
      }

      if (success) {
        // Update context for immediate UI updates
        updateUserProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
          birthDate: profileData.birthDate,
          website: profileData.website
        });
        
        const message = isSuperAdmin() && currentCompany?.id 
          ? "Profile and company data updated successfully"
          : "Profile updated successfully";
          
        toast({
          title: "Success",
          description: message
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (onNavigate: (page: string) => void) => {
    // Reset to original profile data
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.job_title,
        location: profile.location,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        website: profile.website,
        companySlogan: profile.company_slogan || ''
      }));
    }
    onNavigate('tasks');
  };

  const handleEditCompany = (companyId: string) => {
    setEditingCompanyId(companyId);
  };

  const handleBackFromCompanyEdit = () => {
    setEditingCompanyId(null);
  };

  return {
    profileData,
    activeSection,
    setActiveSection,
    showCreateDialog,
    setShowCreateDialog,
    saving,
    loading,
    isSuperAdmin,
    editingCompanyId,
    handleInputChange,
    handleSave,
    handleCancel,
    handleEditCompany,
    handleBackFromCompanyEdit
  };
};