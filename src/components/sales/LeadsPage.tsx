
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
  LayoutGrid,
  List,
  Phone,
  Mail,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const LeadsPage = () => {
  const [viewMode, setViewMode] = useState('kanban');
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
      phone: '+61 400 789 012',
      email: 'm.chen@email.com',
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
      phone: '+61 400 345 678',
      email: 'l.johnson@johnson.com',
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
      phone: '+61 400 567 890',
      email: 'd.wilson@email.com',
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
      phone: '+61 400 234 567',
      email: 'e.thompson@thompson.com',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-gray-100 text-gray-700';
      case 'Contacted': return 'bg-blue-100 text-blue-700';
      case 'Qualified': return 'bg-yellow-100 text-yellow-700';
      case 'Quoted': return 'bg-orange-100 text-orange-700';
      case 'Won': return 'bg-green-100 text-green-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stages = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'];

  const LeadCard = ({ lead }: { lead: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback>{lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{lead.name}</h4>
              <p className="text-sm text-gray-600">{lead.company}</p>
            </div>
          </div>
          <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm"><strong>Service:</strong> {lead.serviceType}</p>
          <p className="text-sm text-green-600 font-medium">
            <DollarSign className="w-3 h-3 inline mr-1" />
            {lead.budget}
          </p>
          <p className="text-sm"><strong>Source:</strong> {lead.source}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Phone className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="w-3 h-3" />
            </Button>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Convert <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads Management</h2>
          <p className="text-gray-600">Track and manage your sales leads</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
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
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stages.map((stage) => (
            <div key={stage} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{stage}</h3>
                <Badge variant="outline">
                  {leads.filter(lead => lead.status === stage).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {leads
                  .filter(lead => lead.status === stage)
                  .map(lead => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <CardDescription>Manage your leads in table view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback>{lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.serviceType}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{lead.phone}</span>
                        <span className="text-sm text-gray-500">{lead.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{lead.budget}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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
