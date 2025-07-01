
import React, { useState } from 'react';
import { LeadsHeader } from './leads/LeadsHeader';
import { LeadsFilters } from './leads/LeadsFilters';
import { LeadsStats } from './leads/LeadsStats';
import { LeadsGrid } from './leads/LeadsGrid';
import { LeadsList } from './leads/LeadsList';

export const LeadsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const leads = [
    {
      id: '1',
      name: 'Michael Chen',
      company: 'Chen Family',
      serviceType: 'Bathroom Renovation',
      budget: '$35,000',
      source: 'Website',
      status: 'New',
      priority: 'High',
      phone: '+61 400 789 012',
      email: 'm.chen@email.com',
      location: 'Sydney, NSW',
      dateAdded: '2 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '2',
      name: 'Lisa Johnson',
      company: 'Johnson Enterprises',
      serviceType: 'Office Fitout',
      budget: '$120,000',
      source: 'Referral',
      status: 'Contacted',
      priority: 'High',
      phone: '+61 400 345 678',
      email: 'l.johnson@johnson.com',
      location: 'Melbourne, VIC',
      dateAdded: '1 week ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '3',
      name: 'David Wilson',
      company: 'Wilson Family',
      serviceType: 'Kitchen Extension',
      budget: '$85,000',
      source: 'Google Ads',
      status: 'Qualified',
      priority: 'Medium',
      phone: '+61 400 567 890',
      email: 'd.wilson@email.com',
      location: 'Brisbane, QLD',
      dateAdded: '3 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '4',
      name: 'Emma Thompson',
      company: 'Thompson Holdings',
      serviceType: 'Commercial Renovation',
      budget: '$200,000',
      source: 'LinkedIn',
      status: 'Quoted',
      priority: 'High',
      phone: '+61 400 234 567',
      email: 'e.thompson@thompson.com',
      location: 'Perth, WA',
      dateAdded: '5 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '5',
      name: 'James Martinez',
      company: 'Martinez Corp',
      serviceType: 'Warehouse Renovation',
      budget: '$150,000',
      source: 'Website',
      status: 'New',
      priority: 'Medium',
      phone: '+61 400 111 222',
      email: 'j.martinez@email.com',
      location: 'Adelaide, SA',
      dateAdded: '1 day ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    },
    {
      id: '6',
      name: 'Sarah Kim',
      company: 'Kim Industries',
      serviceType: 'Retail Fitout',
      budget: '$75,000',
      source: 'Referral',
      status: 'Contacted',
      priority: 'Low',
      phone: '+61 400 333 444',
      email: 's.kim@email.com',
      location: 'Darwin, NT',
      dateAdded: '4 days ago',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
    }
  ];

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsFilters 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      <LeadsStats leads={leads} />
      
      {viewMode === 'grid' ? (
        <LeadsGrid leads={leads} />
      ) : (
        <LeadsList leads={leads} />
      )}
    </div>
  );
};
