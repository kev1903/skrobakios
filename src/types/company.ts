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
  created_at: string;
  updated_at: string;
  created_by?: string;
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