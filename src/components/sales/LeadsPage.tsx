
import React, { useState } from 'react';
import { LeadsHeader } from './leads/LeadsHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LeadsPage = () => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground font-poppins">Lead Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-inter">Lead contacts management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};
