
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContactInfoMask } from './ContactInfoMask';
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
  <Card className="group glass-card glass-hover transition-all duration-300 hover:-translate-y-1 border-white/20">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={lead.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {lead.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {lead.name}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
          <Badge className={`${getStatusColor(lead.status)} border-white/30 font-medium`}>
            {lead.status}
          </Badge>
          <div className="text-right">
            <div className="text-xl font-bold text-green-400">{lead.budget}</div>
            <div className="text-xs text-muted-foreground">Budget</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="font-medium">{lead.serviceType}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground/80">
            <MapPin className="w-3 h-3" />
            <span>{lead.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground/80">
            <Calendar className="w-3 h-3" />
            <span>Added {lead.dateAdded}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 glass border-white/20 hover:bg-primary/20 hover:border-primary/30">
                <Phone className="w-3 h-3 text-primary" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 glass border-white/20 hover:bg-primary/20 hover:border-primary/30">
                <Mail className="w-3 h-3 text-primary" />
              </Button>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 glass-hover">
              Convert <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
