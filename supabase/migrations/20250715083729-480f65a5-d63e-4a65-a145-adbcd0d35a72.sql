-- Create the get_user_subscription function
CREATE OR REPLACE FUNCTION get_user_subscription()
RETURNS TABLE (
  subscription_id uuid,
  plan_name text,
  plan_description text,
  status text,
  billing_cycle text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  price_monthly numeric,
  price_yearly numeric,
  features text[],
  max_projects integer,
  max_team_members integer,
  max_storage_gb integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = auth.uid()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$;