import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Globe, Calendar, Briefcase } from 'lucide-react';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface PersonalSectionProps {
  profileData: {
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
  };
  onInputChange: (field: string, value: string) => void;
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddArrayItem: (field: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
}

export const PersonalSection = ({
  profileData,
  onInputChange,
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem,
}: PersonalSectionProps) => {
  const getUserDisplayName = () => {
    const firstName = profileData.firstName?.trim();
    const lastName = profileData.lastName?.trim();
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || lastName || 'User';
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <ProfilePictureUpload
        currentAvatarUrl={profileData.avatarUrl}
        onAvatarUpdate={(avatarUrl) => onInputChange('avatarUrl', avatarUrl)}
        userName={getUserDisplayName()}
      />
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => onInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => onInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => onInputChange('location', e.target.value)}
                placeholder="Enter your location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => onInputChange('website', e.target.value)}
                placeholder="Enter your website URL"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Job Title</span>
              </Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) => onInputChange('jobTitle', e.target.value)}
                placeholder="Enter your job title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Birth Date</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={profileData.birthDate}
                onChange={(e) => onInputChange('birthDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};