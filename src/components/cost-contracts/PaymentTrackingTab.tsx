import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PaymentTrackingTabProps {
  onNavigate?: (page: string) => void;
}

export const PaymentTrackingTab = ({ onNavigate }: PaymentTrackingTabProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Payment Tracking</h2>
          <p className="text-white/70 font-helvetica">Track supplier and subcontractor payments</p>
        </div>
        <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>
      
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Payment Register</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Payment tracking functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};