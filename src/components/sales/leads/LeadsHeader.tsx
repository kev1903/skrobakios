
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const LeadsHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Leads Management</h2>
        <p className="text-muted-foreground mt-1">Track and manage your sales pipeline</p>
      </div>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 glass-hover">
        <Plus className="w-4 h-4 mr-2" />
        Add New Lead
      </Button>
    </div>
  );
};
