import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { BillingHistory } from '@/components/subscription/BillingHistory';

interface SubscriptionPageProps {
  onNavigate: (page: string) => void;
}

export const SubscriptionPage = ({ onNavigate }: SubscriptionPageProps) => {
  const [activeTab, setActiveTab] = useState('plans');

  const handlePlanSelect = (action?: string) => {
    if (action === 'home') {
      onNavigate('home');
    } else {
      setActiveTab('plans');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Subscription & Billing
            </h1>
            <p className="text-muted-foreground">
              Manage your subscription, billing, and payment history
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="plans">
              <SubscriptionPlans onPlanSelect={handlePlanSelect} />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <BillingHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};