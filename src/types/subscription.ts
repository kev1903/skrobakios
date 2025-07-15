export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_projects: number | null;
  max_team_members: number | null;
  max_storage_gb: number | null;
  features: string[];
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';

// Define feature access based on subscription tiers
export const SUBSCRIPTION_FEATURES = {
  FREE: [
    'basic_dashboard',
    'basic_tasks',
    'basic_files',
    'basic_support'
  ],
  BASIC: [
    'basic_dashboard',
    'basic_tasks',
    'basic_files',
    'basic_support',
    'projects',
    'team_management',
    'basic_reports'
  ],
  PREMIUM: [
    'basic_dashboard',
    'basic_tasks',
    'basic_files',
    'basic_support',
    'projects',
    'team_management',
    'basic_reports',
    'advanced_projects',
    'cost_contracts',
    'advanced_reports',
    'priority_support'
  ],
  ENTERPRISE: [
    'basic_dashboard',
    'basic_tasks',
    'basic_files',
    'basic_support',
    'projects',
    'team_management',
    'basic_reports',
    'advanced_projects',
    'cost_contracts',
    'advanced_reports',
    'priority_support',
    'sales_management',
    'advanced_analytics',
    'custom_integrations',
    'dedicated_support'
  ]
} as const;

export type SubscriptionFeature = typeof SUBSCRIPTION_FEATURES[keyof typeof SUBSCRIPTION_FEATURES][number];