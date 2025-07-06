
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatusColor } from './utils';

interface Lead {
  id: string;
  name: string;
  company: string;
  serviceType: string;
  budget: string;
  source: string;
  status: string;
  priority: string;
  phone: string;
  email: string;
  location: string;
  dateAdded: string;
  avatar: string;
}

interface LeadsListProps {
  leads: Lead[];
}

export const LeadsList = ({ leads }: LeadsListProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">All Leads</CardTitle>
        <CardDescription className="text-muted-foreground">Manage your leads in table view</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 glass border-white/20 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {lead.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">{lead.name}</h4>
                  <p className="text-sm text-muted-foreground">{lead.serviceType}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground/80">{lead.phone}</span>
                    <span className="text-sm text-muted-foreground/80">{lead.email}</span>
                    <span className="text-sm text-muted-foreground/80">{lead.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{lead.budget}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getStatusColor(lead.status)} border-white/30 font-medium`}>
                    {lead.status}
                  </Badge>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 glass-hover">
                    Convert
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
