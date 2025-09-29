import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Target,
  ArrowRight,
  Calendar,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCompany } from '@/contexts/CompanyContext';
import { useProjects, Project } from '@/hooks/useProjects';
import { useBusinessProjects } from '@/hooks/useBusinessProjects';
import { Company } from '@/types/company';

interface BusinessesDashboardProps {
  onNavigate?: (page: string, params?: any) => void;
}

interface BusinessWithProjects {
  business: any;
  projects: Project[];
  metrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pendingProjects: number;
    totalValue: number;
    completionRate: number;
    healthStatus: 'good' | 'warning' | 'critical';
  };
}

export const BusinessesDashboard = ({ onNavigate }: BusinessesDashboardProps) => {
  const [businessesWithProjects, setBusinessesWithProjects] = useState<BusinessWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithProjects[]>([]);
  
  const { companies, loading: companiesLoading } = useCompany();
  const { getProjectsForBusinesses } = useBusinessProjects();

  useEffect(() => {
    const loadBusinessData = async () => {
      setLoading(true);
      try {
        // Filter out personal companies
        const businessCompanies = companies.filter(company => {
          const isPersonalCompany = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'s Company$/i.test(company.name);
          return !isPersonalCompany;
        });

        // Get all business IDs
        const businessIds = businessCompanies.map(b => b.id);
        
        // Fetch projects for all businesses
        const businessProjects = await getProjectsForBusinesses(businessIds);

        const businessData: BusinessWithProjects[] = businessCompanies.map(business => {
          const projects = businessProjects[business.id] || [];
          const metrics = calculateBusinessMetrics(projects);
          
          return {
            business,
            projects,
            metrics
          };
        });

        setBusinessesWithProjects(businessData);
        setFilteredBusinesses(businessData);
      } catch (error) {
        console.error('Error loading business data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!companiesLoading) {
      loadBusinessData();
    }
  }, [companies, companiesLoading, getProjectsForBusinesses]);

  // Filter businesses based on search term
  useEffect(() => {
    const filtered = businessesWithProjects.filter(business =>
      business.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.business.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [searchTerm, businessesWithProjects]);

  const calculateBusinessMetrics = (projects: Project[]) => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'running').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    
    const totalValue = projects.reduce((sum, project) => {
      if (!project.contract_price) return sum;
      const value = parseFloat(project.contract_price.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    // Determine health status based on project metrics
    let healthStatus: 'good' | 'warning' | 'critical' = 'good';
    if (pendingProjects > activeProjects && totalProjects > 0) {
      healthStatus = 'critical';
    } else if (completionRate < 70 && totalProjects > 0) {
      healthStatus = 'warning';
    }

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalValue,
      completionRate,
      healthStatus
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'warning':
        return <Clock className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Calculate overall dashboard metrics
  const overallMetrics = filteredBusinesses.reduce((acc, business) => ({
    totalBusinesses: acc.totalBusinesses + 1,
    totalProjects: acc.totalProjects + business.metrics.totalProjects,
    totalValue: acc.totalValue + business.metrics.totalValue,
    activeProjects: acc.activeProjects + business.metrics.activeProjects,
    completedProjects: acc.completedProjects + business.metrics.completedProjects
  }), {
    totalBusinesses: 0,
    totalProjects: 0,
    totalValue: 0,
    activeProjects: 0,
    completedProjects: 0
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{overallMetrics.totalBusinesses}</div>
              <p className="text-xs text-slate-500">Active businesses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{overallMetrics.totalProjects}</div>
              <p className="text-xs text-slate-500">Across all businesses</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(overallMetrics.totalValue)}</div>
              <p className="text-xs text-slate-500">Combined contract value</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{overallMetrics.activeProjects}</div>
              <p className="text-xs text-slate-500">Currently in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-white/70 backdrop-blur-sm border-white/40"
              />
            </div>
            <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/40">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <span className="text-sm text-slate-600">{filteredBusinesses.length} businesses</span>
        </div>

        {/* Business List */}
        <div className="space-y-4">
          {filteredBusinesses.map((businessData) => (
            <Card key={businessData.business.id} className="bg-card/60 backdrop-blur-sm border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  {/* Business Header */}
                  <div className="flex items-center space-x-4">
                    {businessData.business.logo_url ? (
                      <img
                        src={businessData.business.logo_url}
                        alt={businessData.business.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {businessData.business.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{businessData.business.industry || 'Business'}</p>
                    </div>
                  </div>

                  {/* Inline Metrics and Health Status */}
                  <div className="flex items-center space-x-4">
                    {/* Compact Project Metrics */}
                    <div className="flex items-center space-x-2">
                      <div className="text-center px-2 py-1 rounded bg-muted/30">
                        <div className="text-sm font-semibold text-foreground">{businessData.metrics.totalProjects}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center px-2 py-1 rounded bg-muted/30">
                        <div className="text-sm font-semibold text-green-600">{businessData.metrics.completedProjects}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                      <div className="text-center px-2 py-1 rounded bg-muted/30">
                        <div className="text-sm font-semibold text-orange-600">{businessData.metrics.activeProjects}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center px-2 py-1 rounded bg-muted/30">
                        <div className="text-sm font-semibold text-red-600">{businessData.metrics.pendingProjects}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    {/* Compact Completion Rate */}
                    {businessData.metrics.totalProjects > 0 && (
                      <div className="flex items-center space-x-2 min-w-[120px]">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Completion Rate</span>
                        <div className="flex-1">
                          <Progress value={businessData.metrics.completionRate} className="h-1 w-16" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{businessData.metrics.completionRate}%</span>
                      </div>
                    )}

                    {/* Health Status Badge */}
                    <Badge 
                      className={`${getHealthStatusColor(businessData.metrics.healthStatus)} flex items-center space-x-1`}
                    >
                      {getHealthStatusIcon(businessData.metrics.healthStatus)}
                      <span className="capitalize">{businessData.metrics.healthStatus}</span>
                    </Badge>
                  </div>
                </div>

                {/* Projects List */}
                {businessData.projects.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">Projects</h4>
                    <div className="space-y-2">
                      {businessData.projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                              <Target className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">{project.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {project.contract_price && `${project.contract_price}`}
                                {project.location && ` • ${project.location}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                project.status === 'completed' ? 'default' :
                                project.status === 'running' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {project.status === 'running' ? 'Active' : 
                               project.status === 'completed' ? 'Completed' : 
                               project.status === 'pending' ? 'Pending' : 
                               project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Breakdown and Value */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span>{businessData.metrics.activeProjects} Active</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{businessData.metrics.pendingProjects} Pending</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{businessData.metrics.completedProjects} Done</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {businessData.metrics.totalValue > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Portfolio Value</div>
                        <div className="font-semibold text-foreground">{formatCurrency(businessData.metrics.totalValue)}</div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigate?.('business', { businessId: businessData.business.id })}
                    >
                      View Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && !loading && (
          <Card className="bg-white/70 backdrop-blur-sm border border-white/40">
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">No businesses found</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first business.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onNavigate?.('create-business')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Business
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};