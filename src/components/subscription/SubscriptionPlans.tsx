import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { TrialCongratulations } from './TrialCongratulations';
import { TrialCountdown } from './TrialCountdown';

interface SubscriptionPlansProps {
  onPlanSelect?: (planId: string) => void;
}

export const SubscriptionPlans = ({ onPlanSelect }: SubscriptionPlansProps) => {
  const { 
    availablePlans, 
    currentSubscription, 
    upgradeSubscription, 
    loading,
    isOnTrial,
    trialDaysRemaining
  } = useSubscription();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [trialPlan, setTrialPlan] = useState<SubscriptionPlan | null>(null);

  const handleTrialStart = async (plan: SubscriptionPlan) => {
    if (upgrading) return;
    
    setUpgrading(plan.id);
    const result = await upgradeSubscription(plan.id, billingCycle);
    
    if (result.success) {
      toast({
        title: "Welcome to your 90-day trial!",
        description: "All business modules are now enabled. Redirecting to homepage...",
      });
      
      // Redirect to homepage after a short delay
      setTimeout(() => {
        onPlanSelect?.('home');
      }, 1500);
    } else {
      toast({
        title: "Trial Start Failed",
        description: result.error || "Failed to start trial",
        variant: "destructive",
      });
    }
    
    setUpgrading(null);
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (upgrading) return;
    
    setUpgrading(plan.id);
    const result = await upgradeSubscription(plan.id, billingCycle);
    
    if (result.success) {
      // For paid plans, show congratulations modal
      if (plan.price_monthly > 0 || plan.price_yearly > 0) {
        setTrialPlan(plan);
        setShowCongratulations(true);
      } else {
        toast({
          title: "Plan Updated",
          description: `Successfully switched to ${plan.name} plan`,
        });
      }
      onPlanSelect?.(plan.id);
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "Failed to update subscription",
        variant: "destructive",
      });
    }
    
    setUpgrading(null);
  };

  const isCurrentPlan = (planName: string) => {
    return currentSubscription?.plan_name === planName;
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price_monthly * 12;
    const yearlySaving = monthlyTotal - plan.price_yearly;
    return yearlySaving;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Trial Countdown - Show if user is on trial */}
      {isOnTrial && currentSubscription?.trial_ends_at && (
        <TrialCountdown
          trialEndDate={currentSubscription.trial_ends_at}
          planName={currentSubscription.plan_name}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          All paid plans include a 90-day free trial. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2">
            Save up to 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {availablePlans.map((plan) => {
          const price = getPrice(plan);
          const isPopular = plan.name === 'Business Management';
          const isCurrent = isCurrentPlan(plan.name);
          const isUpgrading = upgrading === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border p-6 space-y-4 ${
                isPopular ? 'border-primary shadow-lg scale-105' : 'border-border'
              } ${isCurrent ? 'bg-muted/50' : 'bg-card'}`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">Current Plan</Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="text-sm text-green-600">
                    Save ${getSavings(plan).toFixed(0)} per year
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                  {plan.max_projects && (
                    <div>Up to {plan.max_projects} projects</div>
                  )}
                  {plan.max_team_members && (
                    <div>Up to {plan.max_team_members} team members</div>
                  )}
                  {plan.max_storage_gb && (
                    <div>{plan.max_storage_gb}GB storage</div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleTrialStart(plan)}
                disabled={isCurrent || isUpgrading}
                className="w-full"
                variant={isPopular ? "default" : "outline"}
              >
                {isUpgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Starting Trial...
                  </>
                ) : isCurrent ? (
                  'Current Plan'
                ) : (
                  `Start 90-Day Trial`
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Trial Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          All paid plans include a 90-day free trial. No credit card required to start.
        </p>
        <p className="text-xs text-muted-foreground">
          Cancel anytime during your trial period with no charges.
        </p>
      </div>

      {/* Congratulations Modal */}
      {showCongratulations && trialPlan && currentSubscription?.trial_ends_at && (
        <TrialCongratulations
          planName={trialPlan.name}
          trialEndDate={currentSubscription.trial_ends_at}
          onClose={() => setShowCongratulations(false)}
        />
      )}
    </div>
  );
};