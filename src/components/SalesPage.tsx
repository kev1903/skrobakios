
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

interface SalesPageProps {
  onNavigate?: (page: string) => void;
}

export const SalesPage = ({ onNavigate }: SalesPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');

  const deals: Deal[] = [
    {
      id: '1',
      title: 'Construction Management Software',
      company: 'BuildCorp Ltd',
      value: 150000,
      stage: 'Proposal',
      probability: 75,
      closeDate: '2024-07-25',
      contact: {
        name: 'John Mitchell',
        email: 'j.mitchell@buildcorp.com',
        phone: '+61 400 123 456',
        avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
      }
    },
    {
      id: '2',
      title: 'Project Estimation Platform',
      company: 'Metro Construction',
      value: 85000,
      stage: 'Negotiation',
      probability: 60,
      closeDate: '2024-08-10',
      contact: {
        name: 'Sarah Davis',
        email: 's.davis@metroconstruction.com',
        phone: '+61 400 654 321',
        avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
      }
    },
    {
      id: '3',
      title: 'Team Collaboration Tools',
      company: 'Skyline Builders',
      value: 45000,
      stage: 'Qualified',
      probability: 40,
      closeDate: '2024-08-30',
      contact: {
        name: 'Michael Chen',
        email: 'm.chen@skylinebuilders.com',
        phone: '+61 400 789 012',
        avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
      }
    },
    {
      id: '4',
      title: 'Enterprise Solution',
      company: 'Prime Developments',
      value: 250000,
      stage: 'Closed Won',
      probability: 100,
      closeDate: '2024-06-15',
      contact: {
        name: 'Lisa Johnson',
        email: 'l.johnson@primedevelopments.com',
        phone: '+61 400 345 678',
        avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
      }
    }
  ];

  const stages = ['all', 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'all' || deal.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-gray-100 text-gray-700';
      case 'Qualified': return 'bg-blue-100 text-blue-700';
      case 'Proposal': return 'bg-yellow-100 text-yellow-700';
      case 'Negotiation': return 'bg-orange-100 text-orange-700';
      case 'Closed Won': return 'bg-green-100 text-green-700';
      case 'Closed Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
  const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const averageDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales CRM</h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline and customer relationships</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWonValue)}</div>
            <p className="text-xs text-muted-foreground">
              {wonDeals.length} deals closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDealSize)}</div>
            <p className="text-xs text-muted-foreground">
              Per opportunity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search deals, companies, or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage === 'all' ? 'All Stages' : stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Deals List */}
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={deal.contact.avatar} />
                        <AvatarFallback>
                          {deal.contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{deal.title}</h3>
                        <p className="text-gray-600">{deal.company}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {deal.contact.email}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {deal.contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(deal.value)}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage}
                        </Badge>
                        <span className="text-sm text-gray-500">{deal.probability}%</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(deal.closeDate)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Manage your customer contacts and communication history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Contact management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Sales Reports</CardTitle>
              <CardDescription>
                View detailed analytics and reports on your sales performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Sales reports and analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
