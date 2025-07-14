import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Building2, MapPin, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PublicNavbar } from './PublicNavbar';

interface DirectoryUser {
  user_id: string;
  first_name: string;
  last_name: string;
  professional_title?: string;
  job_title?: string;
  location?: string;
  avatar_url?: string;
  slug: string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  skills?: string[];
  bio?: string;
}

interface DirectoryCompany {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  verified?: boolean;
  rating?: number;
  review_count?: number;
  slogan?: string;
  year_established?: number;
}

export const PublicDirectory = () => {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [companies, setCompanies] = useState<DirectoryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  const fetchDirectoryData = async () => {
    try {
      setLoading(true);

      // Fetch public user profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, professional_title, job_title, location, avatar_url, slug, verified, rating, review_count, skills, bio')
        .eq('public_profile', true)
        .order('verified', { ascending: false })
        .order('rating', { ascending: false })
        .limit(50);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch public company profiles  
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, slug, logo_url, industry, company_size, verified, rating, review_count, slogan, year_established')
        .eq('public_page', true)
        .order('verified', { ascending: false })
        .order('rating', { ascending: false })
        .limit(50);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load directory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.professional_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = selectedLocation === 'all' || user.location?.includes(selectedLocation);
    
    return matchesSearch && matchesLocation;
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.slogan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get unique industries and locations for filters
  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));
  const locations = Array.from(new Set(users.map(u => u.location).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PublicNavbar currentPage="directory" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Professional Directory
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover talented professionals and innovative companies in the construction and architecture industry
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search professionals, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                {activeTab === 'companies' && (
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {activeTab === 'users' && (
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Professionals ({filteredUsers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Businesses ({filteredCompanies.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.user_id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                        <AvatarFallback>
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/profile/${user.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                          >
                            {user.first_name} {user.last_name}
                          </a>
                          {user.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        {user.professional_title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {user.professional_title}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {user.job_title && (
                        <p className="text-sm font-medium">{user.job_title}</p>
                      )}
                      
                      {user.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </div>
                      )}
                      
                      {user.rating && user.review_count && user.review_count > 0 && (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{user.rating.toFixed(1)} ({user.review_count} reviews)</span>
                        </div>
                      )}
                      
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                      
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Businesses Tab */}
          <TabsContent value="companies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={company.logo_url} alt={company.name} />
                        <AvatarFallback>
                          {getCompanyInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/company/${company.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                          >
                            {company.name}
                          </a>
                          {company.verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        {company.industry && (
                          <p className="text-sm text-muted-foreground truncate">
                            {company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {company.slogan && (
                        <p className="text-sm font-medium line-clamp-2">{company.slogan}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {company.company_size && (
                          <Badge variant="outline">{company.company_size}</Badge>
                        )}
                        
                        {company.year_established && (
                          <Badge variant="outline">Est. {company.year_established}</Badge>
                        )}
                      </div>
                      
                      {company.rating && company.review_count && company.review_count > 0 && (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{company.rating.toFixed(1)} ({company.review_count} reviews)</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};