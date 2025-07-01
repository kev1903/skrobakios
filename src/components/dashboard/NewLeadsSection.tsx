
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreHorizontal, ArrowUpDown, TrendingUp } from 'lucide-react';

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
      priority: 'High',
      value: '$25K'
    },
    {
      id: 2,
      name: 'Darlene Robertson',
      title: 'Product Designer at StartupXYZ',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Contacted',
      priority: 'Medium',
      value: '$18K'
    },
    {
      id: 3,
      name: 'Wade Warren',
      title: 'Sales Director at GrowthCo',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Qualified',
      priority: 'High',
      value: '$42K'
    },
    {
      id: 4,
      name: 'Jonah Jude',
      title: 'Business Analyst at DataTech',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      status: 'Proposal',
      priority: 'Low',
      value: '$12K'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Qualified': return 'bg-green-100 text-green-700 border-green-200';
      case 'Proposal': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3366FF]" />
              New Leads
            </CardTitle>
            <Badge className="bg-[#E6F0FF] text-[#3366FF] border-[#4D8BFF] px-3 py-1 text-xs font-medium">
              7 new
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('sales')}
              className="px-4 hover:bg-[#E6F0FF] border-[#4D8BFF] text-[#3366FF]"
            >
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                      <AvatarImage src={lead.avatar} />
                      <AvatarFallback className="bg-[#3366FF] text-white">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getPriorityColor(lead.priority)} ring-2 ring-white`}></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#3366FF] transition-colors">{lead.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{lead.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(lead.status)} text-xs px-3 py-1 font-medium border`}>
                  {lead.status}
                </Badge>
                <div className="text-sm font-bold text-[#3366FF]">
                  {lead.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
