
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
  );
};
