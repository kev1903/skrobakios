
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const LeadsHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Leads Management</h2>
        <p className="text-gray-600 mt-1">Track and manage your sales pipeline</p>
      </div>
      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg">
        <Plus className="w-4 h-4 mr-2" />
        Add New Lead
      </Button>
    </div>
  );
};
