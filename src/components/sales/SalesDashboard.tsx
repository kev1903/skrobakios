import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

interface Opportunity {
  id: string;
  company: string;
  contact: string;
  avatar: string;
  description: string;
  value: number;
  priority: 'High' | 'Medium' | 'Low';
  source: string;
  lastActivity: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  count: number;
  totalValue: number;
  opportunities: Opportunity[];
}

export const SalesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stages: Stage[] = [
    {
      id: 'lead',
      name: 'Lead',
      color: 'bg-blue-500',
      count: 4,
      totalValue: 156000,
      opportunities: [
        {
          id: '1',
          company: 'Medium',
          contact: 'John Doe',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Digital transformation project',
          value: 54000,
          priority: 'Medium',
          source: 'Website',
          lastActivity: '2 days ago'
        },
        {
          id: '2',
          company: 'Paypal',
          contact: 'Sarah Wilson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 42000,
          priority: 'High',
          source: 'Referral',
          lastActivity: '1 day ago'
        },
        {
          id: '3',
          company: 'Northlake',
          contact: 'Mike Johnson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Rebranding Strategy',
          value: 28000,
          priority: 'Low',
          source: 'LinkedIn',
          lastActivity: '3 days ago'
        },
        {
          id: '4',
          company: 'Quora',
          contact: 'Emma Davis',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Smartwatch App',
          value: 32000,
          priority: 'Medium',
          source: 'Google Ads',
          lastActivity: '5 days ago'
        }
      ]
    },
    {
      id: 'contacted',
      name: 'Contacted',
      color: 'bg-orange-500',
      count: 3,
      totalValue: 98000,
      opportunities: [
        {
          id: '5',
          company: 'Pinterest',
          contact: 'Alex Brown',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 45000,
          priority: 'High',
          source: 'Social Media',
          lastActivity: '1 day ago'
        },
        {
          id: '6',
          company: 'Slack',
          contact: 'Lisa Chen',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 38000,
          priority: 'Medium',
          source: 'Partnership',
          lastActivity: '2 days ago'
        },
        {
          id: '7',
          company: 'Reddit',
          contact: 'Tom Anderson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Rebranding Strategy',
          value: 15000,
          priority: 'Low',
          source: 'Cold Email',
          lastActivity: '4 days ago'
        }
      ]
    },
    {
      id: 'qualified',
      name: 'Qualified',
      color: 'bg-purple-500',
      count: 4,
      totalValue: 142000,
      opportunities: [
        {
          id: '8',
          company: 'Flock',
          contact: 'Rachel Green',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Rebranding Strategy',
          value: 35000,
          priority: 'Medium',
          source: 'Referral',
          lastActivity: '1 day ago'
        },
        {
          id: '9',
          company: 'Notion',
          contact: 'David Kim',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Article',
          value: 47000,
          priority: 'High',
          source: 'Website',
          lastActivity: '3 days ago'
        },
        {
          id: '10',
          company: 'Snapchat',
          contact: 'Jennifer Lee',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 35000,
          priority: 'Medium',
          source: 'Social Media',
          lastActivity: '2 days ago'
        },
        {
          id: '11',
          company: 'OTT',
          contact: 'Mark Wilson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 25000,
          priority: 'Low',
          source: 'Conference',
          lastActivity: '1 week ago'
        }
      ]
    },
    {
      id: 'proposal',
      name: 'Proposal made',
      color: 'bg-yellow-500',
      count: 3,
      totalValue: 89000,
      opportunities: [
        {
          id: '12',
          company: 'Instagram',
          contact: 'Chris Taylor',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Blog article',
          value: 34000,
          priority: 'High',
          source: 'Social Media',
          lastActivity: '2 days ago'
        },
        {
          id: '13',
          company: 'Facebook',
          contact: 'Amanda White',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 28000,
          priority: 'Medium',
          source: 'Partnership',
          lastActivity: '4 days ago'
        },
        {
          id: '14',
          company: 'TikTok',
          contact: 'Kevin Brown',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Rebranding Strategy',
          value: 27000,
          priority: 'Medium',
          source: 'Social Media',
          lastActivity: '1 day ago'
        }
      ]
    },
    {
      id: 'won',
      name: 'Won',
      color: 'bg-green-500',
      count: 2,
      totalValue: 78000,
      opportunities: [
        {
          id: '15',
          company: 'NFL',
          contact: 'Michael Johnson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Blog article',
          value: 44000,
          priority: 'High',
          source: 'Partnership',
          lastActivity: '1 week ago'
        },
        {
          id: '16',
          company: 'PLD',
          contact: 'Sophie Turner',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 34000,
          priority: 'Medium',
          source: 'Referral',
          lastActivity: '2 weeks ago'
        }
      ]
    },
    {
      id: 'lost',
      name: 'Lost',
      color: 'bg-red-500',
      count: 1,
      totalValue: 25000,
      opportunities: [
        {
          id: '17',
          company: 'Paypal',
          contact: 'James Wilson',
          avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
          description: 'Software development',
          value: 25000,
          priority: 'Medium',
          source: 'Cold Email',
          lastActivity: '1 month ago'
        }
      ]
    }
  ];

  const totalOpportunities = stages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Total Opportunities</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{totalOpportunities}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground font-poppins">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Active Leads</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{stages[0].count}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Won This Month</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{stages[4].count}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-border w-64 font-inter"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40 glass-card border-border font-inter">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-inter">
          <Plus className="w-4 h-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-6">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <Card className="glass-card h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <CardTitle className="text-sm font-semibold text-foreground font-inter">
                        {stage.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        {stage.count}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${stage.totalValue.toLocaleString()}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-0">
                  {stage.opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="glass-card hover:glass-hover transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={opportunity.avatar} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {opportunity.contact.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm text-foreground font-poppins">{opportunity.company}</h4>
                                <p className="text-xs text-muted-foreground font-inter">{opportunity.contact}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(opportunity.priority)}`}>
                              {opportunity.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground font-inter">{opportunity.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-primary font-poppins">
                              ${opportunity.value.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                                <Phone className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-inter">
                            <span>{opportunity.source}</span>
                            <span>{opportunity.lastActivity}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center glass-card border-dashed hover:bg-muted font-inter"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Opportunity
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};