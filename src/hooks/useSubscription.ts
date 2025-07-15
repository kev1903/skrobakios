import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  // Fetch available subscription plans
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

  // Fetch current user subscription
  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      // Instead of using RPC which relies on auth.uid(), fetch directly with user ID
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          billing_cycle,
          trial_ends_at,
          current_period_end,
          subscription_plans!inner(
            id,
            name,
            description,
            price_monthly,
            price_yearly,
            features,
            max_projects,
            max_team_members,
            max_storage_gb
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const subscriptionRow = data[0];
        const plan = subscriptionRow.subscription_plans;
        
        console.log('✅ Subscription loaded:', plan.name, 'Features:', plan.features);
        
        setCurrentSubscription({
          subscription_id: subscriptionRow.id,
          plan_name: plan.name,
          plan_description: plan.description || '',
          status: subscriptionRow.status,
          billing_cycle: subscriptionRow.billing_cycle,
          trial_ends_at: subscriptionRow.trial_ends_at,
          current_period_end: subscriptionRow.current_period_end,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          features: Array.isArray(plan.features) ? plan.features.filter((f): f is string => typeof f === 'string') : [],
          max_projects: plan.max_projects,
          max_team_members: plan.max_team_members,
          max_storage_gb: plan.max_storage_gb
        });
      } else {
        console.log('🔍 Subscription Debug - No subscription data found');
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching user subscription:', err);
      setError('Failed to load subscription details');
    }
  };

  // Check if user is on trial
  const isOnTrial = () => {
    if (!currentSubscription) return false;
    return currentSubscription.status === 'trial' && 
           currentSubscription.trial_ends_at && 
           new Date(currentSubscription.trial_ends_at) > new Date();
  };

  // Get days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!currentSubscription?.trial_ends_at) return 0;
    const trialEnd = new Date(currentSubscription.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Check if user has access to a feature
  const hasFeature = (feature: string) => {
    const result = currentSubscription?.features.includes(feature) || false;
    if (!result) {
      console.log(`❌ Missing feature "${feature}". Available:`, currentSubscription?.features);
    }
    return result;
  };

  // Check if user can perform action based on limits
  const canPerformAction = (action: 'project' | 'team_member', currentCount: number) => {
    if (!currentSubscription) return false;

    switch (action) {
      case 'project':
        return currentSubscription.max_projects === null || currentCount < currentSubscription.max_projects;
      case 'team_member':
        return currentSubscription.max_team_members === null || currentCount < currentSubscription.max_team_members;
      default:
        return true;
    }
  };

  // Upgrade subscription
  const upgradeSubscription = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user already has a subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const trialEndDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan_id: planId,
            billing_cycle: billingCycle,
            status: 'trial',
            trial_ends_at: trialEndDate,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_id: planId,
            billing_cycle: billingCycle,
            status: 'trial',
            trial_ends_at: trialEndDate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
      
      await fetchCurrentSubscription();
      return { success: true };
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to upgrade subscription' };
    } finally {
      setLoading(false);
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

    loadData();
  }, [user]);

  return {
    currentSubscription,
    availablePlans,
    loading,
    error,
    isOnTrial: isOnTrial(),
    trialDaysRemaining: getTrialDaysRemaining(),
    hasFeature,
    canPerformAction,
    upgradeSubscription,
    refetch: () => {
      fetchCurrentSubscription();
      fetchAvailablePlans();
    }
  };
};