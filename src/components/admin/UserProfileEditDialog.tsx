import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { useAdminProfile } from '@/hooks/useAdminProfile';

interface UserProfileEditDialogProps {
  user: HierarchicalUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export const UserProfileEditDialog = ({
  user,
  open,
  onOpenChange,
  onProfileUpdated
}: UserProfileEditDialogProps) => {
  const { loading, fetchUserProfile, saveUserProfile } = useAdminProfile();
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    location: '',
    bio: '',
    avatar_url: '',
    birth_date: '',
    website: '',
    company_slogan: '',
  });

  // Load user profile when dialog opens
  useEffect(() => {
    if (open && user) {
      loadUserProfile();
    }
  }, [open, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const profile = await fetchUserProfile(user.user_id);
    if (profile) {
      setProfileData(profile);
    } else {
      // Initialize with existing user data if no profile exists
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        job_title: '',
        company: user.company || '',
        location: '',
        bio: '',
        avatar_url: user.avatar_url || '',
        birth_date: '',
        website: '',
        company_slogan: '',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const success = await saveUserProfile(user.user_id, profileData);
    
    if (success) {
      onProfileUpdated?.();
      onOpenChange(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>
            Update profile information for {user.first_name} {user.last_name}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback>
                  {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={profileData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profileData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={profileData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_slogan">Company Slogan</Label>
                <Input
                  id="company_slogan"
                  value={profileData.company_slogan}
                  onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading || saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};