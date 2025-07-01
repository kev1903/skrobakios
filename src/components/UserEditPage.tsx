
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Briefcase, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface UserEditPageProps {
  onNavigate: (page: string) => void;
}

export const UserEditPage = ({ onNavigate }: UserEditPageProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
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
    website: 'https://wade-warren.design'
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleCancel = () => {
    onNavigate('tasks');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      {/* Header with Glassmorphism */}
      <div className="relative backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
                <p className="text-sm text-slate-500 mt-1">Update your personal information and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="backdrop-blur-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Profile Picture Section */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xl font-semibold">Profile Picture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8">
              <div className="relative group">
                <Avatar className="w-28 h-28 ring-4 ring-white/50 shadow-xl">
                  <AvatarImage src={profileData.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-slate-100 text-blue-600 font-semibold">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm group-hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg">Upload a new photo</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Choose a photo that represents you well. We support JPG, PNG, and GIF formats up to 5MB.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick} 
                  className="mt-4 backdrop-blur-sm bg-white/60 border-white/30 hover:bg-blue-50/60 hover:border-blue-200/50 hover:text-blue-600 transition-all duration-200"
                >
                  Choose File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xl font-semibold">Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Date of Birth</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={profileData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xl font-semibold">Professional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-slate-700 font-medium">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={profileData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-700 font-medium">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2 text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-700 font-medium">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
