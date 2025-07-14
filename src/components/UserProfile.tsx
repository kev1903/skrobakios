import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Edit3,
  Save,
  Camera,
  Globe,
  Github,
  Twitter,
  Star,
  Award,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  onNavigate: (page: string) => void;
}

export const UserProfile = ({ onNavigate }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode for new users
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    jobTitle: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
    skills: [] as string[],
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          jobTitle: data.job_title || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          linkedin: (data.social_links as any)?.linkedin || '',
          twitter: (data.social_links as any)?.twitter || '',
          github: (data.social_links as any)?.github || '',
          skills: data.skills || [],
          avatar_url: data.avatar_url || ''
        });
        // If profile exists and has basic info, don't start in edit mode
        if (data.first_name && data.last_name) {
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const socialLinks = {
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        github: profile.github
      };

      const profileData = {
        user_id: user.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        job_title: profile.jobTitle,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        social_links: socialLinks,
        skills: profile.skills,
        avatar_url: profile.avatar_url,
        status: 'active'
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = () => {
    return `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('business-dashboard')}
            >
              Go to Dashboard
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-xl bg-purple-100 text-purple-700">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.firstName || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.lastName || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.location || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.bio || 'No bio added yet'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  {isEditing ? (
                    <Input
                      id="jobTitle"
                      value={profile.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      placeholder="Your current position"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.jobTitle || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.website || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        + Add Skill
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      value={profile.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.linkedin || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  {isEditing ? (
                    <Input
                      id="twitter"
                      value={profile.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourusername"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.twitter || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="github">GitHub</Label>
                  {isEditing ? (
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  ) : (
                    <p className="p-2 text-sm">{profile.github || 'Not set'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Welcome Message for New Users */}
        {isEditing && !profile.firstName && (
          <Card className="glass-card border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Welcome to SkrobakiOS!</h3>
                  <p className="text-sm text-purple-700">Complete your profile to get started</p>
                </div>
              </div>
              <p className="text-sm text-purple-600">
                Fill in your basic information above and click "Save Changes" to complete your profile setup.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};