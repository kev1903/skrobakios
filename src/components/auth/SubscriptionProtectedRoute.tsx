import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature: string;
  onNavigate: (page: string) => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const SubscriptionProtectedRoute: React.FC<SubscriptionProtectedRouteProps> = ({ 
  children, 
  requiredFeature, 
  onNavigate,
  fallbackTitle,
  fallbackDescription
}) => {
  const { hasFeature, currentSubscription } = useSubscription();

  // Check if user has access to the required feature
  if (hasFeature(requiredFeature)) {
    return <>{children}</>;
  }

  // Show upgrade prompt if user doesn't have access
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-800">
            {fallbackTitle || `${requiredFeature} Required`}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {fallbackDescription || `This feature requires a subscription plan that includes ${requiredFeature}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 border">
            <div className="text-sm text-slate-600 mb-1">Current Plan</div>
            <div className="font-medium text-slate-800">
              {currentSubscription?.plan_name || 'FREE'}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => onNavigate('subscription')} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Upgrade Subscription
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('home')} 
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};