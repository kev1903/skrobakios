import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Globe, Phone, Mail, Calendar, Building2, Star, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PublicNavbar } from './PublicNavbar';

interface PublicProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  slug: string;
  professional_title?: string;
  years_experience?: number;
  skills?: string[];
  services?: string[];
  social_links?: any;
  meta_title?: string;
  meta_description?: string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  media_urls: string[] | null;
  is_featured: boolean | null;
  case_study_url: string | null;
  project_date: string | null;
}

export const PublicUserProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPublicProfile();
    }
  }, [slug]);

  useEffect(() => {
    if (profile?.user_id) {
      fetchPortfolioItems();
    }
  }, [profile?.user_id]);

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('owner_id', profile?.user_id)
        .eq('owner_type', 'user')
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    }
  };

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .eq('public_profile', true)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setNotFound(true);
        return;
      }

      if (!data) {
        setNotFound(true);
        return;
      }

      setProfile(data);
      
      // Set meta tags for SEO
      if (data.meta_title) {
        document.title = data.meta_title;
      } else {
        document.title = `${data.first_name} ${data.last_name} - Professional Profile`;
      }
      
      if (data.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.meta_description);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'website':
      case 'portfolio':
        return <Globe className="h-4 w-4" />;
      case 'linkedin':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <User className="h-32 w-32 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The profile you're looking for doesn't exist or is not publicly available.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PublicNavbar currentPage="profile" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0">
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.first_name, profile.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                {profile.professional_title && (
                  <p className="text-xl text-muted-foreground mb-2">{profile.professional_title}</p>
                )}
                
                {profile.job_title && (
                  <p className="text-lg text-muted-foreground mb-2">{profile.job_title}</p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.years_experience && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{profile.years_experience} years experience</span>
                    </div>
                  )}
                  
                  {profile.rating && profile.review_count && profile.review_count > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{profile.rating.toFixed(1)} ({profile.review_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {portfolioItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Featured work and projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="group cursor-pointer">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-3">
                          {item.media_urls?.[0] ? (
                            <img
                              src={item.media_urls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                          {item.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-600 text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(profile.social_links).map(([platform, url]) => (
                    <div key={platform} className="flex items-center space-x-2">
                      {getSocialIcon(platform)}
                      <a 
                        href={typeof url === 'string' && url.startsWith('http') ? url : `https://${url}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline capitalize"
                      >
                        {platform}
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Call to Action */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Interested in working together?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <a href={`mailto:${profile.email}?subject=Professional Inquiry`}>
                    Send Message
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};