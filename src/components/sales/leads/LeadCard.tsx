
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Building,
  ArrowRight,
  Star
} from 'lucide-react';
import { getStatusColor, getPriorityColor, getPriorityIcon } from './utils';

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

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard = ({ lead }: LeadCardProps) => (
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
            <Star className={`w-3 h-3 ${getPriorityIcon(lead.priority)}`} />
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
