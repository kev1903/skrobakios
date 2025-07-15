import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard, Crown, User } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
  onManageBilling?: () => void;
}

export const SubscriptionStatus = ({ onUpgrade, onManageBilling }: SubscriptionStatusProps) => {
  const { 
    currentSubscription, 
    isOnTrial, 
    trialDaysRemaining, 
    loading 
  } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSubscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No Active Subscription</h3>
              <p className="text-sm text-muted-foreground">
                Choose a plan to get started
              </p>
            </div>
            <Button onClick={onUpgrade}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isOnTrial) {
      return (
        <Badge variant="secondary">
          Trial - {trialDaysRemaining} days left
        </Badge>
      );
    }

    switch (currentSubscription.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{currentSubscription.status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isFreeplan = currentSubscription.plan_name === 'FREE';
  const currentPrice = currentSubscription.billing_cycle === 'monthly' 
    ? currentSubscription.price_monthly 
    : currentSubscription.price_yearly;

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">{currentSubscription.plan_name}</CardTitle>
                <CardDescription>{currentSubscription.plan_description}</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {isFreeplan ? 'Free Plan' : `$${currentPrice}/${currentSubscription.billing_cycle === 'monthly' ? 'month' : 'year'}`}
              </span>
            </div>
            {!isFreeplan && (
              <Button variant="outline" size="sm" onClick={onManageBilling}>
                Manage Billing
              </Button>
            )}
          </div>

          {/* Next Billing Date */}
          {currentSubscription.current_period_end && !isFreeplan && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {isOnTrial ? 'Trial ends' : 'Next billing'}: {formatDate(currentSubscription.current_period_end)}
              </span>
            </div>
          )}

          {/* Trial Warning */}
          {isOnTrial && trialDaysRemaining <= 7 && trialDaysRemaining > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Trial ending soon
                  </p>
                  <p className="text-sm text-orange-700">
                    Your trial ends in {trialDaysRemaining} days. Add a payment method to continue using premium features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onUpgrade}>
              {isFreeplan ? 'Upgrade Plan' : 'Change Plan'}
            </Button>
            {!isFreeplan && (
              <Button variant="ghost" size="sm">
                Download Invoice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {currentSubscription.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Usage Limits */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <h4 className="font-medium text-sm">Usage Limits</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              {currentSubscription.max_projects && (
                <div>Projects: Up to {currentSubscription.max_projects}</div>
              )}
              {currentSubscription.max_team_members && (
                <div>Team Members: Up to {currentSubscription.max_team_members}</div>
              )}
              {currentSubscription.max_storage_gb && (
                <div>Storage: {currentSubscription.max_storage_gb}GB</div>
              )}
              {!currentSubscription.max_projects && !currentSubscription.max_team_members && (
                <div>Unlimited usage</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};