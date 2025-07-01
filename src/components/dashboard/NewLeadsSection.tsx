
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';

interface NewLeadsSectionProps {
  onNavigate: (page: string) => void;
}

export const NewLeadsSection = ({ onNavigate }: NewLeadsSectionProps) => {
  const leads = [
    {
      id: 1,
      name: 'Jane Doe',
      title: 'Marketing Manager at TechCorp',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'New',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Darlene Robertson',
      title: 'Product Designer at StartupXYZ',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Contacted',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Wade Warren',
      title: 'Sales Director at GrowthCo',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Qualified',
      priority: 'High'
    },
    {
      id: 4,
      name: 'Jonah Jude',
      title: 'Business Analyst at DataTech',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Proposal',
      priority: 'Low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-yellow-100 text-yellow-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      case 'Proposal': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityDots = (priority: string) => {
    const dots = [];
    const colors = {
      'High': ['bg-red-500', 'bg-red-300', 'bg-red-100'],
      'Medium': ['bg-yellow-500', 'bg-yellow-300', 'bg-gray-200'],
      'Low': ['bg-green-500', 'bg-gray-200', 'bg-gray-200']
    };
    
    const priorityColors = colors[priority as keyof typeof colors] || colors.Low;
    
    for (let i = 0; i < 3; i++) {
      dots.push(
        <div key={i} className={`w-2 h-2 rounded-full ${priorityColors[i]}`} />
      );
    }
    
    return dots;
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-semibold">New Leads</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
              7 new
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('sales')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={lead.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900">{lead.name}</h4>
                    <p className="text-sm text-gray-500">{lead.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(lead.status)} text-xs px-2 py-1 font-medium`}>
                  {lead.status}
                </Badge>
                <div className="flex items-center gap-1">
                  {getPriorityDots(lead.priority)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
