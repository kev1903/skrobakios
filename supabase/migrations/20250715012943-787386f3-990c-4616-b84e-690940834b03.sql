-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_projects INTEGER,
  max_team_members INTEGER,
  max_storage_gb INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, cancelled, expired
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing history table
CREATE TABLE public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL, -- pending, paid, failed, refunded
  stripe_invoice_id TEXT,
  billing_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for billing_history
CREATE POLICY "Users can view their own billing history" 
ON public.billing_history 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service can insert billing records" 
ON public.billing_history 
FOR INSERT 
WITH CHECK (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_projects, max_team_members, max_storage_gb, sort_order) VALUES
('FREE', 'Individual profile and basic features', 0, 0, '["Individual Profile", "Basic Dashboard", "Limited Storage"]'::jsonb, 1, 1, 1, 1),
('Project Management', 'Perfect for project-focused teams', 29, 290, '["Individual Profile", "Unlimited Projects", "Project Templates", "Task Management", "File Sharing", "Basic Analytics"]'::jsonb, null, 10, 10, 2),
('Business Management', 'Complete business operations suite', 59, 590, '["Everything in Project Management", "CRM & Lead Management", "Financial Management", "Advanced Analytics", "Team Collaboration", "Integrations"]'::jsonb, null, 25, 50, 3),
('Asset Management', 'Full construction management platform', 99, 990, '["Everything in Business Management", "Digital Twin Technology", "BIM Integration", "IoT Monitoring", "Advanced Reporting", "Priority Support"]'::jsonb, null, null, 100, 4);

-- Create function to automatically start trial for new users
CREATE OR REPLACE FUNCTION public.start_user_trial()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the FREE plan ID
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE name = 'FREE' LIMIT 1;
  
  -- Create a subscription record for the new user
  INSERT INTO public.user_subscriptions (
    user_id, 
    plan_id, 
    status, 
    trial_ends_at,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.user_id, 
    free_plan_id, 
    'active',
    null,
    now(),
    now() + interval '1 year'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to start trial when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.start_user_trial();

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  plan_description TEXT,
  status TEXT,
  billing_cycle TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  price_monthly DECIMAL,
  price_yearly DECIMAL,
  features JSONB,
  max_projects INTEGER,
  max_team_members INTEGER,
  max_storage_gb INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    us.id,
    sp.name,
    sp.description,
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
  WHERE us.user_id = target_user_id
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;