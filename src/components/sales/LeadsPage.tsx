
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Plus,
  LayoutGrid,
  List,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  Calendar,
  User,
  Building,
  ArrowRight,
  Star
} from 'lucide-react';

export const LeadsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const leads = [
    {
      id: '1',
      name: 'Michael Chen',
      company: 'Chen Family',
      serviceType: 'Bathroom Renovation',
      budget: '$35,000',
      source: 'Website',
      status: 'New',
      priority: 'High',
      phone: '+61 400 789 012',
      email: 'm.chen@email.com',
      location: 'Sydney, NSW',
      dateAdded: '2 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '2',
      name: 'Lisa Johnson',
      company: 'Johnson Enterprises',
      serviceType: 'Office Fitout',
      budget: '$120,000',
      source: 'Referral',
      status: 'Contacted',
      priority: 'High',
      phone: '+61 400 345 678',
      email: 'l.johnson@johnson.com',
      location: 'Melbourne, VIC',
      dateAdded: '1 week ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '3',
      name: 'David Wilson',
      company: 'Wilson Family',
      serviceType: 'Kitchen Extension',
      budget: '$85,000',
      source: 'Google Ads',
      status: 'Qualified',
      priority: 'Medium',
      phone: '+61 400 567 890',
      email: 'd.wilson@email.com',
      location: 'Brisbane, QLD',
      dateAdded: '3 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '4',
      name: 'Emma Thompson',
      company: 'Thompson Holdings',
      serviceType: 'Commercial Renovation',
      budget: '$200,000',
      source: 'LinkedIn',
      status: 'Quoted',
      priority: 'High',
      phone: '+61 400 234 567',
      email: 'e.thompson@thompson.com',
      location: 'Perth, WA',
      dateAdded: '5 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '5',
      name: 'James Martinez',
      company: 'Martinez Corp',
      serviceType: 'Warehouse Renovation',
      budget: '$150,000',
      source: 'Website',
      status: 'New',
      priority: 'Medium',
      phone: '+61 400 111 222',
      email: 'j.martinez@email.com',
      location: 'Adelaide, SA',
      dateAdded: '1 day ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '6',
      name: 'Sarah Kim',
      company: 'Kim Industries',
      serviceType: 'Retail Fitout',
      budget: '$75,000',
      source: 'Referral',
      status: 'Contacted',
      priority: 'Low',
      phone: '+61 400 333 444',
      email: 's.kim@email.com',
      location: 'Darwin, NT',
      dateAdded: '4 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Qualified': return 'bg-green-100 text-green-700 border-green-200';
      case 'Quoted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <Star className="w-3 h-3 fill-current" />;
      case 'Medium': return <Star className="w-3 h-3" />;
      case 'Low': return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const LeadCard = ({ lead }: { lead: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-blue-100">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {lead.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {lead.name}
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="w-3 h-3" />
                <span>{lead.company}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getPriorityColor(lead.priority)}`}>
              {getPriorityIcon(lead.priority)}
              <span className="text-xs font-medium">{lead.priority}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(lead.status)} border font-medium`}>
              {lead.status}
            </Badge>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">{lead.budget}</div>
              <div className="text-xs text-gray-500">Budget</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-3 h-3" />
              <span className="font-medium">{lead.serviceType}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{lead.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Added {lead.dateAdded}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300">
                  <Phone className="w-3 h-3 text-blue-600" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300">
                  <Mail className="w-3 h-3 text-blue-600" />
                </Button>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md">
                Convert <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Leads Management</h2>
          <p className="text-gray-600 mt-1">Track and manage your sales pipeline</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leads by name, company, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Leads</p>
                <p className="text-3xl font-bold">{leads.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Qualified</p>
                <p className="text-3xl font-bold">{leads.filter(l => l.status === 'Qualified').length}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold">{leads.filter(l => l.status === 'Contacted').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold">$665K</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-xl">All Leads</CardTitle>
            <CardDescription>Manage your leads in table view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {lead.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.serviceType}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{lead.phone}</span>
                        <span className="text-sm text-gray-500">{lead.email}</span>
                        <span className="text-sm text-gray-500">{lead.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{lead.budget}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getStatusColor(lead.status)} border font-medium`}>
                        {lead.status}
                      </Badge>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                        Convert
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
