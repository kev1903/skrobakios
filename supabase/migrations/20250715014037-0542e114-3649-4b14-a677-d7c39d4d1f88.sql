-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  max_projects INTEGER,
  max_team_members INTEGER,
  max_storage_gb INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  UNIQUE(user_id)
);

-- Create billing history table
CREATE TABLE public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  billing_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (readable by all authenticated users)
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "users_can_view_own_subscription" ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_subscription" ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_subscription" ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for billing_history
CREATE POLICY "users_can_view_own_billing_history" ON public.billing_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order) VALUES
('FREE', 'Perfect for individuals getting started', 0, 0, '{"Basic project management", "5GB storage", "Email support"}', 3, 3, 5, 1),
('Professional', 'Best for growing teams and businesses', 29, 290, '{"Advanced project management", "Unlimited projects", "50GB storage", "Priority support", "Team collaboration", "Custom workflows"}', null, 10, 50, 2),
('Enterprise', 'For large organizations with advanced needs', 99, 990, '{"Everything in Professional", "Unlimited storage", "Unlimited team members", "24/7 phone support", "Custom integrations", "Advanced security", "Dedicated account manager"}', null, null, null, 3);

-- Create function to automatically start trial for new users
CREATE OR REPLACE FUNCTION public.start_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the FREE plan ID
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    trial_ends_at,
    current_period_start,
    current_period_end
  )
  SELECT 
    NEW.user_id,
    sp.id,
    'trial',
    'monthly',
    NOW() + INTERVAL '90 days',
    NOW(),
    NOW() + INTERVAL '90 days'
  FROM public.subscription_plans sp
  WHERE sp.name = 'FREE'
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to start trial when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.start_user_trial();

-- Create function to get user subscription details
CREATE OR REPLACE FUNCTION public.get_user_subscription(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  plan_description TEXT,
  status TEXT,
  billing_cycle TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  price_monthly DECIMAL,
  price_yearly DECIMAL,
  features TEXT[],
  max_projects INTEGER,
  max_team_members INTEGER,
  max_storage_gb INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id as subscription_id,
    sp.name as plan_name,
    sp.description as plan_description,
    us.status,
    us.billing_cycle,
    us.trial_ends_at,
    us.current_period_end,
    sp.price_monthly,
    sp.price_yearly,
    sp.features,
    sp.max_projects,
    sp.max_team_members,
    sp.max_storage_gb
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();