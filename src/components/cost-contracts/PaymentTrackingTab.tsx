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
          <h2 className="text-2xl font-bold text-gray-900">Payment Tracking</h2>
          <p className="text-gray-600">Track supplier and subcontractor payments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payment Register</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Payment tracking functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};