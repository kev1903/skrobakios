
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmailDeliveryChecker } from './EmailDeliveryChecker';
import { EmailDeliveryTroubleshooting } from './EmailDeliveryTroubleshooting';
import { Mail, BookOpen, BarChart3 } from 'lucide-react';

export const EmailDeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState<'checker' | 'troubleshooting'>('checker');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Delivery Management System
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'checker' ? 'default' : 'outline'}
              onClick={() => setActiveTab('checker')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Delivery Checker
            </Button>
            <Button 
              variant={activeTab === 'troubleshooting' ? 'default' : 'outline'}
              onClick={() => setActiveTab('troubleshooting')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Troubleshooting Guide
            </Button>
          </div>
        </CardHeader>
      </Card>

      {activeTab === 'checker' && <EmailDeliveryChecker />}
      {activeTab === 'troubleshooting' && <EmailDeliveryTroubleshooting />}
    </div>
  );
};
