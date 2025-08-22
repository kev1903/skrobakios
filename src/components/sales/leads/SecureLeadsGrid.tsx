import React from 'react';
import { SecureLeadCard } from './SecureLeadCard';
import { Lead } from '@/hooks/useLeads';

interface SecureLeadsGridProps {
  leads: Lead[];
  onContact?: (lead: Lead, type: 'phone' | 'email') => void;
  onConvert?: (lead: Lead) => void;
}

export const SecureLeadsGrid = ({ leads, onContact, onConvert }: SecureLeadsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {leads.map(lead => (
        <SecureLeadCard 
          key={lead.id} 
          lead={lead} 
          onContact={onContact}
          onConvert={onConvert}
        />
      ))}
    </div>
  );
};