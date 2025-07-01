
import React from 'react';
import { LeadCard } from './LeadCard';

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

interface LeadsGridProps {
  leads: Lead[];
}

export const LeadsGrid = ({ leads }: LeadsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
};
