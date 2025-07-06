
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User,
  Star,
  Calendar,
  DollarSign
} from 'lucide-react';

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

interface LeadsStatsProps {
  leads: Lead[];
}

export const LeadsStats = ({ leads }: LeadsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-foreground">{leads.length}</p>
            </div>
            <User className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-green-400/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Qualified</p>
              <p className="text-3xl font-bold text-foreground">{leads.filter(l => l.status === 'Qualified').length}</p>
            </div>
            <Star className="w-8 h-8 text-green-400" />
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-yellow-400/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-foreground">{leads.filter(l => l.status === 'Contacted').length}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card border-purple-400/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold text-foreground">$665K</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
