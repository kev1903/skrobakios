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
  Star,
  Globe
} from 'lucide-react';
import { Lead } from '@/hooks/useLeads';

// Utility functions for status and priority colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'lead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'qualified': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'proposal made': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'won': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

interface SecureLeadCardProps {
  lead: Lead;
  onContact?: (lead: Lead, type: 'phone' | 'email') => void;
  onConvert?: (lead: Lead) => void;
}

export const SecureLeadCard = ({ lead, onContact, onConvert }: SecureLeadCardProps) => {
  const isContactMasked = lead.contact_email?.includes('***') || lead.contact_phone?.includes('***');

  return (
    <Card className="group glass-card glass-hover transition-all duration-300 hover:-translate-y-1 border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={lead.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {lead.contact_name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {lead.contact_name}
              </h4>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building className="w-3 h-3" />
                <span>{lead.company}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getPriorityColor(lead.priority)}`}>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-medium">{lead.priority}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(lead.stage)} border-white/30 font-medium`}>
              {lead.stage}
            </Badge>
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">${lead.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Value</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="font-medium">{lead.source}</span>
            </div>
            {lead.location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground/80">
                <MapPin className="w-3 h-3" />
                <span>{lead.location}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground/80">
                <Globe className="w-3 h-3" />
                <span className="truncate">{lead.website}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground/80">
              <Calendar className="w-3 h-3" />
              <span>{lead.last_activity || 'No activity'}</span>
            </div>
          </div>

          {/* Secure contact information section */}
          <div className="pt-2 space-y-1">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <ContactInfoMask 
                value={lead.contact_email} 
                type="email" 
                isMasked={isContactMasked} 
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <ContactInfoMask 
                value={lead.contact_phone} 
                type="phone" 
                isMasked={isContactMasked} 
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0 glass border-white/20 hover:bg-primary/20 hover:border-primary/30"
                  onClick={() => onContact?.(lead, 'phone')}
                  disabled={!lead.contact_phone || isContactMasked}
                >
                  <Phone className="w-3 h-3 text-primary" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0 glass border-white/20 hover:bg-primary/20 hover:border-primary/30"
                  onClick={() => onContact?.(lead, 'email')}
                  disabled={!lead.contact_email || isContactMasked}
                >
                  <Mail className="w-3 h-3 text-primary" />
                </Button>
              </div>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 glass-hover"
                onClick={() => onConvert?.(lead)}
              >
                Convert <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};