
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
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Leads</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Qualified</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.status === 'Qualified').length}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.status === 'Contacted').length}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-200" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold">$665K</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
