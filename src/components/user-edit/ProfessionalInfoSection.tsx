
import React from 'react';
import { Briefcase, MapPin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfessionalInfoSectionProps {
  profileData: {
    jobTitle: string;
    company: string;
    location: string;
    website: string;
    bio: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ProfessionalInfoSection = ({ profileData, onInputChange }: ProfessionalInfoSectionProps) => {
  return (
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
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-700 font-medium">Company</Label>
            <Input
              id="company"
              value={profileData.company}
              onChange={(e) => onInputChange('company', e.target.value)}
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
            onChange={(e) => onInputChange('location', e.target.value)}
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
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder="https://your-website.com"
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-slate-700 font-medium">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
