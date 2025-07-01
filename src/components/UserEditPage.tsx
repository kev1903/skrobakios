
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Briefcase, Calendar, Globe, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-slate-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Glassmorphism Header */}
      <div className="relative z-10">
        <div className="backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-2xl">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/10 rounded-xl px-4 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                    Edit Profile
                  </h1>
                  <p className="text-slate-600 mt-2 font-medium">Customize your personal information and preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="backdrop-blur-xl bg-white/20 border-white/30 hover:bg-white/30 text-slate-700 hover:text-slate-900 transition-all duration-300 rounded-xl px-6 py-3 font-medium shadow-lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="backdrop-blur-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl px-8 py-3 font-semibold"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-8 space-y-8">
        {/* Profile Picture Section */}
        <Card className="backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="pb-8 bg-gradient-to-r from-white/5 to-blue-50/10">
            <CardTitle className="flex items-center space-x-4 text-slate-800">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm shadow-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Profile Picture</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center space-x-12">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Avatar className="relative w-32 h-32 ring-4 ring-white/30 shadow-2xl group-hover:scale-105 transition-all duration-300">
                  <AvatarImage src={profileData.avatarUrl} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-bold">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 backdrop-blur-sm group-hover:scale-110 border-2 border-white/20"
                >
                  <Camera className="w-5 h-5" />
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
                <h3 className="font-bold text-slate-800 text-xl mb-3">Upload a new photo</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Choose a photo that represents you well. We support JPG, PNG, and GIF formats up to 5MB.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick} 
                  className="backdrop-blur-xl bg-white/20 border-white/30 hover:bg-blue-50/30 hover:border-blue-200/50 hover:text-blue-700 transition-all duration-300 rounded-xl px-6 py-3 font-medium shadow-lg"
                >
                  Choose File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="pb-8 bg-gradient-to-r from-white/5 to-blue-50/10">
            <CardTitle className="flex items-center space-x-4 text-slate-800">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm shadow-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-slate-700 font-semibold text-sm uppercase tracking-wide">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center space-x-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="flex items-center space-x-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="birthDate" className="flex items-center space-x-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Date of Birth</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={profileData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="pb-8 bg-gradient-to-r from-white/5 to-blue-50/10">
            <CardTitle className="flex items-center space-x-4 text-slate-800">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm shadow-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Professional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="jobTitle" className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={profileData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="company" className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="flex items-center space-x-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="website" className="flex items-center space-x-3 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 rounded-xl h-12 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-slate-700 font-semibold text-sm uppercase tracking-wide">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
                className="backdrop-blur-xl bg-white/20 border-white/30 focus:bg-white/30 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-none rounded-xl text-slate-800 font-medium p-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
