
import React from 'react';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalInfoSectionProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalInfoSection = ({ profileData, onInputChange }: PersonalInfoSectionProps) => {
  return (
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
              onChange={(e) => onInputChange('firstName', e.target.value)}
              className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
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
            onChange={(e) => onInputChange('email', e.target.value)}
            readOnly={!!profileData.email} // Make read-only if pre-populated
            className={`backdrop-blur-sm border-white/30 focus:border-blue-300 transition-all duration-200 ${
              profileData.email 
                ? 'bg-gray-100/60 cursor-not-allowed text-gray-700' 
                : 'bg-white/60 focus:bg-white/80'
            }`}
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
            onChange={(e) => onInputChange('phone', e.target.value)}
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
            onChange={(e) => onInputChange('birthDate', e.target.value)}
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center space-x-2 text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Home Address</span>
          </Label>
          <Input
            id="location"
            value={profileData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="Enter your home address"
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
          />
        </div>
      </CardContent>
    </Card>
  );
};
