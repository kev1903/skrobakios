import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Globe, Phone, Mail, Users, Star, ExternalLink, Calendar } from 'lucide-react';
import { ReviewList } from '@/components/review/ReviewList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PublicNavbar } from './PublicNavbar';

interface PublicCompany {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
  abn?: string;
  slogan?: string;
  industry?: string;
  company_size?: string;
  year_established?: number;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  social_links?: any;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
}

interface CompanyMember {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  job_title?: string;
  role: string;
  slug?: string;
}

export const PublicCompanyProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPublicCompany();
    }
  }, [slug]);

  const fetchPublicCompany = async () => {
    try {
      setLoading(true);
      
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('public_page', true)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        setNotFound(true);
        return;
      }

      if (!companyData) {
        setNotFound(true);
        return;
      }

      setCompany(companyData);

      // Fetch company members (public profiles only)
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select(`
          user_id,
          role,
          profiles!inner(
            first_name,
            last_name,
            avatar_url,
            job_title,
            slug,
            public_profile
          )
        `)
        .eq('company_id', companyData.id)
        .eq('status', 'active')
        .eq('profiles.public_profile', true);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      } else {
        const formattedMembers = membersData
          ?.map((member: any) => ({
            user_id: member.user_id,
            role: member.role,
            first_name: member.profiles.first_name,
            last_name: member.profiles.last_name,
            avatar_url: member.profiles.avatar_url,
            job_title: member.profiles.job_title,
            slug: member.profiles.slug,
          }))
          .filter(Boolean) || [];
        
        setMembers(formattedMembers);
      }
      
      // Set meta tags for SEO
      if (companyData.meta_title) {
        document.title = companyData.meta_title;
      } else {
        document.title = `${companyData.name} - Company Profile`;
      }
      
      if (companyData.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', companyData.meta_description);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'website':
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
          <p className="mt-4 text-muted-foreground">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-32 w-32 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Company Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The company profile you're looking for doesn't exist or is not publicly available.
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
      <PublicNavbar currentPage="company" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0">
                <AvatarImage src={company.logo_url} alt={company.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(company.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  {company.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                {company.slogan && (
                  <p className="text-xl text-muted-foreground mb-2">{company.slogan}</p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  {company.industry && (
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  
                  {company.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.address}</span>
                    </div>
                  )}
                  
                  {company.company_size && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{company.company_size}</span>
                    </div>
                  )}
                  
                  {company.year_established && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Est. {company.year_established}</span>
                    </div>
                  )}
                  
                  {company.rating && company.review_count && company.review_count > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{company.rating.toFixed(1)} ({company.review_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.slogan && (
                  <div>
                    <h4 className="font-semibold mb-2">Mission</h4>
                    <p className="text-muted-foreground">{company.slogan}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.industry && (
                    <div>
                      <h4 className="font-semibold mb-1">Industry</h4>
                      <p className="text-muted-foreground">{company.industry}</p>
                    </div>
                  )}
                  
                  {company.company_size && (
                    <div>
                      <h4 className="font-semibold mb-1">Company Size</h4>
                      <p className="text-muted-foreground">{company.company_size}</p>
                    </div>
                  )}
                  
                  {company.year_established && (
                    <div>
                      <h4 className="font-semibold mb-1">Founded</h4>
                      <p className="text-muted-foreground">{company.year_established}</p>
                    </div>
                  )}
                  
                  {company.abn && (
                    <div>
                      <h4 className="font-semibold mb-1">ABN</h4>
                      <p className="text-muted-foreground">{company.abn}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            {members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Meet the people behind {company.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div 
                        key={member.user_id} 
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                          <AvatarFallback>
                            {getInitials(`${member.first_name} ${member.last_name}`)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold truncate">
                              {member.slug ? (
                                <Link 
                                  to={`/profile/${member.slug}`}
                                  className="text-primary hover:underline"
                                >
                                  {member.first_name} {member.last_name}
                                </Link>
                              ) : (
                                `${member.first_name} ${member.last_name}`
                              )}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                          {member.job_title && (
                            <p className="text-sm text-muted-foreground truncate">
                              {member.job_title}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  What clients say about working with {company.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewList 
                  revieweeId={company.id} 
                  revieweeType="company"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                      {company.phone}
                    </a>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                
                {company.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{company.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {company.social_links && Object.keys(company.social_links).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(company.social_links).map(([platform, url]) => (
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
                  Interested in working with {company.name}?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.website && (
                  <Button className="w-full" asChild>
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </Button>
                )}
                
                {company.phone && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${company.phone}`}>
                      Call Now
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/directory">
                    Write a Review
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};