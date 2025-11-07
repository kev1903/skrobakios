import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STRIPE_PRODUCTS, getProductByStripeId } from '@/config/stripe';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_projects: number | null;
  max_team_members: number | null;
  max_storage_gb: number | null;
  sort_order: number;
}

export interface UserSubscription {
  subscription_id: string;
  plan_name: string;
  plan_description: string;
  status: string;
  billing_cycle: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_projects: number | null;
  max_team_members: number | null;
  max_storage_gb: number | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailablePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      const plans: SubscriptionPlan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : [],
        max_projects: plan.max_projects,
        max_team_members: plan.max_team_members,
        max_storage_gb: plan.max_storage_gb,
        sort_order: plan.sort_order
      }));
      
      setAvailablePlans(plans);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError('Failed to load subscription plans');
    }
  };

  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) {
      setCurrentSubscription(null);
      return;
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');

      if (functionError) throw functionError;
      
      // Map Stripe subscription to UserSubscription format
      if (data?.subscribed && data?.product_id) {
        const product = getProductByStripeId(data.product_id);
        
        if (product) {
          setCurrentSubscription({
            subscription_id: data.product_id,
            plan_name: product.name,
            plan_description: `${product.name} subscription`,
            status: 'active',
            billing_cycle: 'monthly',
            trial_ends_at: null,
            current_period_end: data.subscription_end,
            price_monthly: product.price_monthly,
            price_yearly: product.price_monthly * 12, // Approximate
            features: [...product.features],
            max_projects: null,
            max_team_members: null,
            max_storage_gb: null,
          });
        } else {
          setCurrentSubscription(null);
        }
      } else {
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    }
  }, [user]);

  const isOnTrial = (): boolean => {
    return false; // Stripe manages trials
  };

  const getTrialDaysRemaining = (): number => {
    return 0; // Stripe manages trials
  };

  const trialDaysRemaining = getTrialDaysRemaining();

  const hasFeature = (feature: string) => {
    return true;
  };

  const canPerformAction = (action: 'project' | 'team_member', currentCount: number) => {
    return true;
  };

  const createCheckout = async (priceId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (functionError) throw functionError;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error creating checkout:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create checkout' };
    }
  };

  const upgradeSubscription = async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    // Find the Stripe product that matches the plan
    const stripeProduct = Object.values(STRIPE_PRODUCTS).find(p => 
      p.name === planId || p.product_id === planId
    );

    if (!stripeProduct) {
      return { success: false, error: 'Plan not found' };
    }

    return createCheckout(stripeProduct.price_id);
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error: functionError } = await supabase.functions.invoke('customer-portal');

      if (functionError) throw functionError;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      
      return data;
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailablePlans(),
        fetchCurrentSubscription()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
      
      const interval = setInterval(() => {
        fetchCurrentSubscription();
      }, 60000);
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setCurrentSubscription(null);
    }
  }, [user, fetchCurrentSubscription]);

  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    return getProductByStripeId(currentSubscription.subscription_id);
  };

  return {
    currentSubscription,
    availablePlans,
    loading,
    error,
    isOnTrial,
    getTrialDaysRemaining,
    trialDaysRemaining,
    hasFeature,
    canPerformAction,
    createCheckout,
    upgradeSubscription,
    openCustomerPortal,
    refreshSubscription: fetchCurrentSubscription,
    getCurrentPlan,
  };
};
