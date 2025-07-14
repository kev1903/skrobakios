-- Phase 1: Database Schema & Multi-Tenancy Foundation

-- Extend companies table for organization features
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS year_established INTEGER;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Construction';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+'));
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update company_members with construction-specific roles
ALTER TABLE public.company_members DROP CONSTRAINT IF EXISTS company_members_role_check;
ALTER TABLE public.company_members ADD CONSTRAINT company_members_role_check 
CHECK (role IN ('owner', 'admin', 'manager', 'worker', 'supplier'));

-- Extend profiles table for enhanced user directory
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS services TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'company')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  media_urls TEXT[],
  case_study_url TEXT,
  project_date DATE,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('user', 'company')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  project_context TEXT,
  is_verified_collaboration BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, reviewee_type)
);

-- Extend projects table for metaverse features
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS bim_model_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS iot_status JSONB DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS digital_twin_events JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'construction';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create user_contexts table for context switching
CREATE TABLE IF NOT EXISTS public.user_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('personal', 'company')),
  context_id UUID, -- NULL for personal, company_id for company context
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, context_type, context_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_owner ON public.portfolio_items(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_public ON public.portfolio_items(is_public);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id, reviewee_type);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_services ON public.profiles USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON public.profiles(public_profile);

CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON public.companies(rating);

CREATE INDEX IF NOT EXISTS idx_user_contexts_user ON public.user_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contexts_active ON public.user_contexts(user_id, is_active);

-- Enable RLS on new tables
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contexts ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_items
CREATE POLICY "Portfolio items are viewable by everyone when public" ON public.portfolio_items
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own portfolio items" ON public.portfolio_items
  FOR SELECT USING (
    (owner_type = 'user' AND owner_id = auth.uid()) OR
    (owner_type = 'company' AND owner_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ))
  );

CREATE POLICY "Users can manage their own portfolio items" ON public.portfolio_items
  FOR ALL USING (
    (owner_type = 'user' AND owner_id = auth.uid()) OR
    (owner_type = 'company' AND owner_id IN (
      SELECT company_id FROM company_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin', 'manager')
    ))
  );

-- RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone when active" ON public.reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- RLS policies for user_contexts
CREATE POLICY "Users can manage their own contexts" ON public.user_contexts
  FOR ALL USING (user_id = auth.uid());

-- Function to calculate average ratings
CREATE OR REPLACE FUNCTION public.update_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user ratings
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.reviewee_type = 'user' THEN
      UPDATE public.profiles 
      SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'user' AND status = 'active'),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'user' AND status = 'active')
      WHERE user_id = NEW.reviewee_id;
    ELSIF NEW.reviewee_type = 'company' THEN
      UPDATE public.companies 
      SET 
        rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'company' AND status = 'active'),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id AND reviewee_type = 'company' AND status = 'active')
      WHERE id = NEW.reviewee_id;
    END IF;
  END IF;

  -- Handle deletions
  IF TG_OP = 'DELETE' THEN
    IF OLD.reviewee_type = 'user' THEN
      UPDATE public.profiles 
      SET 
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'user' AND status = 'active'), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'user' AND status = 'active')
      WHERE user_id = OLD.reviewee_id;
    ELSIF OLD.reviewee_type = 'company' THEN
      UPDATE public.companies 
      SET 
        rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'company' AND status = 'active'), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id AND reviewee_type = 'company' AND status = 'active')
      WHERE id = OLD.reviewee_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_rating_stats();

-- Function to manage user context switching
CREATE OR REPLACE FUNCTION public.set_active_context(
  p_context_type TEXT,
  p_context_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate all contexts for the user
  UPDATE public.user_contexts 
  SET is_active = false 
  WHERE user_id = auth.uid();

  -- Insert or update the new active context
  INSERT INTO public.user_contexts (user_id, context_type, context_id, is_active)
  VALUES (auth.uid(), p_context_type, p_context_id, true)
  ON CONFLICT (user_id, context_type, context_id)
  DO UPDATE SET is_active = true;

  RETURN true;
END;
$$;

-- Function to get current user context
CREATE OR REPLACE FUNCTION public.get_current_context()
RETURNS TABLE(
  context_type TEXT,
  context_id UUID,
  context_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.context_type,
    uc.context_id,
    CASE 
      WHEN uc.context_type = 'personal' THEN CONCAT(p.first_name, ' ', p.last_name)
      WHEN uc.context_type = 'company' THEN c.name
      ELSE 'Unknown'
    END as context_name
  FROM public.user_contexts uc
  LEFT JOIN public.profiles p ON uc.user_id = p.user_id AND uc.context_type = 'personal'
  LEFT JOIN public.companies c ON uc.context_id = c.id AND uc.context_type = 'company'
  WHERE uc.user_id = auth.uid() AND uc.is_active = true
  LIMIT 1;
END;
$$;

-- Update triggers for timestamps
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();