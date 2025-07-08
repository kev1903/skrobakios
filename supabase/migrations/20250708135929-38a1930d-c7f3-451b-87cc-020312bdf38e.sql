-- Create Xero OAuth states table for secure OAuth flow
CREATE TABLE IF NOT EXISTS public.xero_oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Xero connections table to store access tokens
CREATE TABLE IF NOT EXISTS public.xero_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Xero invoices table to store synced invoice data
CREATE TABLE IF NOT EXISTS public.xero_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xero_invoice_id TEXT NOT NULL UNIQUE,
  invoice_number TEXT,
  contact_name TEXT,
  date DATE,
  due_date DATE,
  total DECIMAL(10,2),
  amount_due DECIMAL(10,2),
  status TEXT,
  type TEXT,
  currency_code TEXT,
  reference TEXT,
  sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Xero contacts table to store synced contact data
CREATE TABLE IF NOT EXISTS public.xero_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xero_contact_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  contact_status TEXT,
  is_supplier BOOLEAN DEFAULT false,
  is_customer BOOLEAN DEFAULT false,
  sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Xero accounts table to store synced account data
CREATE TABLE IF NOT EXISTS public.xero_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  xero_account_id TEXT NOT NULL UNIQUE,
  code TEXT,
  name TEXT NOT NULL,
  type TEXT,
  tax_type TEXT,
  enable_payments_to_account BOOLEAN DEFAULT false,
  show_in_expense_claims BOOLEAN DEFAULT false,
  class TEXT,
  sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all Xero tables
ALTER TABLE public.xero_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xero_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xero_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xero_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xero_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for xero_oauth_states
CREATE POLICY "Users can manage their own OAuth states" 
ON public.xero_oauth_states 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for xero_connections
CREATE POLICY "Users can view their own Xero connection" 
ON public.xero_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Xero connection" 
ON public.xero_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Xero connection" 
ON public.xero_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Xero connection" 
ON public.xero_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for xero_invoices
CREATE POLICY "Users can view their own Xero invoices" 
ON public.xero_invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage Xero invoices during sync" 
ON public.xero_invoices 
FOR ALL 
USING (true);

-- Create RLS policies for xero_contacts
CREATE POLICY "Users can view their own Xero contacts" 
ON public.xero_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage Xero contacts during sync" 
ON public.xero_contacts 
FOR ALL 
USING (true);

-- Create RLS policies for xero_accounts
CREATE POLICY "Users can view their own Xero accounts" 
ON public.xero_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage Xero accounts during sync" 
ON public.xero_accounts 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_xero_oauth_states_user_id ON public.xero_oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_xero_oauth_states_state ON public.xero_oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_xero_oauth_states_expires_at ON public.xero_oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_xero_connections_user_id ON public.xero_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_xero_connections_tenant_id ON public.xero_connections(tenant_id);

CREATE INDEX IF NOT EXISTS idx_xero_invoices_user_id ON public.xero_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_xero_invoices_xero_id ON public.xero_invoices(xero_invoice_id);
CREATE INDEX IF NOT EXISTS idx_xero_invoices_date ON public.xero_invoices(date);

CREATE INDEX IF NOT EXISTS idx_xero_contacts_user_id ON public.xero_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_xero_contacts_xero_id ON public.xero_contacts(xero_contact_id);

CREATE INDEX IF NOT EXISTS idx_xero_accounts_user_id ON public.xero_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_xero_accounts_xero_id ON public.xero_accounts(xero_account_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_xero_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_xero_connections_updated_at
BEFORE UPDATE ON public.xero_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_xero_updated_at();

CREATE TRIGGER update_xero_invoices_updated_at
BEFORE UPDATE ON public.xero_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_xero_updated_at();

CREATE TRIGGER update_xero_contacts_updated_at
BEFORE UPDATE ON public.xero_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_xero_updated_at();

CREATE TRIGGER update_xero_accounts_updated_at
BEFORE UPDATE ON public.xero_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_xero_updated_at();