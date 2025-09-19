export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
  abn?: string;
  slogan?: string;
  business_type?: 'sole_trader' | 'partnership' | 'company' | 'trust';
  industry?: string;
  company_size?: string;
  year_established?: number;
  service_areas?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  onboarding_completed?: boolean;
  verified?: boolean;
  subscription_tier?: string;
  public_page?: boolean;
  member_count?: number;
  project_count?: number;
  business_admins?: BusinessAdmin[];
}

export interface BusinessAdmin {
  user_id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserCompany {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
  business_type?: 'sole_trader' | 'partnership' | 'company' | 'trust';
}

export interface CreateCompanyData {
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
  abn?: string;
  slogan?: string;
  business_type?: string;
  industry?: string;
  company_size?: string;
  service_areas?: string[];
  certification_status?: string;
  year_established?: number;
  onboarding_completed?: boolean;
}