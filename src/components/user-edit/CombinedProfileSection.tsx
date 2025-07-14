import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Settings,
  Users,
  Shield,
  Info,
  AlertCircle
} from 'lucide-react';
import { ProfilePictureSection } from './ProfilePictureSection';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompany } from '@/contexts/CompanyContext';
import { useUserRole } from '@/hooks/useUserRole';

interface CombinedProfileSectionProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl: string;
    jobTitle: string;
    location: string;
    bio: string;
    birthDate: string;
    website: string;
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyPhone: string;
    companySlogan: string;
    businessType: string;
    industry: string;
    companySize: string;
    yearEstablished: number;
    serviceAreas: string[];
  };
  onInputChange: (field: string, value: string) => void;
}

const BUSINESS_TYPES = [
  { 
    value: 'individual', 
    label: 'Individual/Freelancer',
    description: 'Solo professionals offering specialized services'
  },
  { 
    value: 'small_business', 
    label: 'Small Business',
    description: 'Small teams and local businesses (2-50 employees)'
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise',
    description: 'Large corporations with multiple departments'
  },
  { 
    value: 'agency', 
    label: 'Agency',
    description: 'Creative or service agencies working with multiple clients'
  },
  { 
    value: 'freelancer', 
    label: 'Freelancer',
    description: 'Independent contractors and consultants'
  }
];

const INDUSTRIES = [
  'Construction', 'Technology', 'Healthcare', 'Finance', 'Education',
  'Manufacturing', 'Retail', 'Real Estate', 'Marketing', 'Consulting',
  'Legal', 'Architecture', 'Engineering', 'Design', 'Other'
];

const COMPANY_SIZES = [
  '1 employee', '2-10 employees', '11-50 employees', 
  '51-200 employees', '201-500 employees', '500+ employees'
];

export const CombinedProfileSection = ({ 
  profileData, 
  onInputChange 
}: CombinedProfileSectionProps) => {
  const [activeTab, setActiveTab] = useState('personal');
  const { currentCompany } = useCompany();
  const { role, isSuperAdmin, isCompanyAdmin } = useUserRole();

  const selectedBusinessType = BUSINESS_TYPES.find(type => type.value === profileData.businessType);

  const canEditCompanyInfo = isSuperAdmin() || (currentCompany && ['owner', 'admin'].includes(currentCompany.role));

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-white">
            <User className="w-5 h-5" />
            <span>Profile Overview</span>
            <Badge variant="secondary" className="ml-auto">
              {role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProfilePictureSection 
                avatarUrl={profileData.avatarUrl}
                firstName={profileData.firstName}
                lastName={profileData.lastName}
                onAvatarChange={(url) => onInputChange('avatarUrl', url)}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-white/70">{profileData.jobTitle || 'No job title set'}</p>
                <p className="text-white/60 text-sm">{profileData.email}</p>
              </div>
              {currentCompany && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{currentCompany.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentCompany.role}
                    </Badge>
                    {selectedBusinessType && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedBusinessType.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Profile Management Tabs */}
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-white/20 p-4">
              <TabsList className="grid w-full grid-cols-4 bg-white/5">
                <TabsTrigger value="personal" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Personal</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="personal" className="space-y-6 mt-0">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => onInputChange('firstName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => onInputChange('lastName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => onInputChange('email', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => onInputChange('phone', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => onInputChange('jobTitle', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => onInputChange('location', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-white">Personal Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => onInputChange('website', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate" className="text-white">Birth Date</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => onInputChange('birthDate', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => onInputChange('bio', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-6 mt-0">
                {!canEditCompanyInfo && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/20">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-200">
                      You need owner or admin permissions to edit company information.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Business Type Explanation */}
                {selectedBusinessType && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">Business Type: {selectedBusinessType.label}</span>
                    </div>
                    <p className="text-blue-200 text-sm">{selectedBusinessType.description}</p>
                  </div>
                )}

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Business Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-white">Business Name</Label>
                      <Input
                        id="companyName"
                        value={profileData.companyName}
                        onChange={(e) => onInputChange('companyName', e.target.value)}
                        disabled={!canEditCompanyInfo}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType" className="text-white">Business Type</Label>
                      <Select 
                        value={profileData.businessType} 
                        onValueChange={(value) => onInputChange('businessType', value)}
                        disabled={!canEditCompanyInfo}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-50">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-white">Industry</Label>
                      <Select 
                        value={profileData.industry} 
                        onValueChange={(value) => onInputChange('industry', value)}
                        disabled={!canEditCompanyInfo}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-50">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companySize" className="text-white">Company Size</Label>
                      <Select 
                        value={profileData.companySize} 
                        onValueChange={(value) => onInputChange('companySize', value)}
                        disabled={!canEditCompanyInfo}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white disabled:opacity-50">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="abn" className="text-white">ABN</Label>
                      <Input
                        id="abn"
                        value={profileData.abn}
                        onChange={(e) => onInputChange('abn', e.target.value)}
                        disabled={!canEditCompanyInfo}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearEstablished" className="text-white">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        value={profileData.yearEstablished || ''}
                        onChange={(e) => onInputChange('yearEstablished', e.target.value)}
                        disabled={!canEditCompanyInfo}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone" className="text-white">Company Phone</Label>
                      <Input
                        id="companyPhone"
                        value={profileData.companyPhone}
                        onChange={(e) => onInputChange('companyPhone', e.target.value)}
                        disabled={!canEditCompanyInfo}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyWebsite" className="text-white">Company Website</Label>
                      <Input
                        id="companyWebsite"
                        value={profileData.companyWebsite}
                        onChange={(e) => onInputChange('companyWebsite', e.target.value)}
                        disabled={!canEditCompanyInfo}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="companyAddress" className="text-white">Company Address</Label>
                    <Input
                      id="companyAddress"
                      value={profileData.companyAddress}
                      onChange={(e) => onInputChange('companyAddress', e.target.value)}
                      disabled={!canEditCompanyInfo}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companySlogan" className="text-white">Company Slogan</Label>
                    <Input
                      id="companySlogan"
                      value={profileData.companySlogan}
                      onChange={(e) => onInputChange('companySlogan', e.target.value)}
                      disabled={!canEditCompanyInfo}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 disabled:opacity-50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Account Settings</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-white/60 text-sm">Receive notifications about account activity</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">Marketing Emails</Label>
                        <p className="text-white/60 text-sm">Receive updates about new features and promotions</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <Label className="text-white">Public Profile</Label>
                        <p className="text-white/60 text-sm">Make your profile visible to other users</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Settings</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      Active Sessions
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};