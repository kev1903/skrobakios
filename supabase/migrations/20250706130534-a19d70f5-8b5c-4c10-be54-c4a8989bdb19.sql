-- Create leads table for Sales CRM
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  avatar_url TEXT,
  description TEXT,
  value NUMERIC NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  source TEXT NOT NULL DEFAULT 'Website',
  stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Contacted', 'Qualified', 'Proposal made', 'Won', 'Lost')),
  location TEXT,
  website TEXT,
  notes TEXT,
  last_activity TEXT DEFAULT 'Recently added',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for lead access
CREATE POLICY "Anyone can view leads" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update leads" 
ON public.leads 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete leads" 
ON public.leads 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.leads (company, contact_name, contact_email, contact_phone, avatar_url, description, value, priority, source, stage, location, website, notes, last_activity) VALUES
('Medium', 'John Doe', 'john@medium.com', '+1-555-0101', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Digital transformation project', 54000, 'Medium', 'Website', 'Lead', 'San Francisco, CA', 'www.medium.com', 'Initial contact made via website inquiry. Very interested in our services.', '2 days ago'),
('Paypal', 'Sarah Wilson', 'sarah@paypal.com', '+1-555-0102', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Software development', 42000, 'High', 'Referral', 'Lead', 'New York, NY', 'www.paypal.com', 'Referred by existing client. Needs urgent solution.', '1 day ago'),
('Northlake', 'Mike Johnson', 'mike@northlake.com', '+1-555-0103', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Rebranding Strategy', 28000, 'Low', 'LinkedIn', 'Lead', 'Chicago, IL', 'www.northlake.com', 'Connected through LinkedIn. Timeline is flexible.', '3 days ago'),
('Quora', 'Emma Davis', 'emma@quora.com', '+1-555-0104', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Smartwatch App', 32000, 'Medium', 'Google Ads', 'Lead', 'Austin, TX', 'www.quora.com', 'Found us through Google Ads. Good budget fit.', '5 days ago'),
('Pinterest', 'Alex Brown', 'alex@pinterest.com', '+1-555-0105', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Software development', 45000, 'High', 'Social Media', 'Contacted', 'Seattle, WA', 'www.pinterest.com', 'Active engagement. Ready to move forward.', '1 day ago'),
('Slack', 'Lisa Chen', 'lisa@slack.com', '+1-555-0106', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Software development', 38000, 'Medium', 'Partnership', 'Contacted', 'Los Angeles, CA', 'www.slack.com', 'Partnership opportunity identified.', '2 days ago'),
('Reddit', 'Tom Anderson', 'tom@reddit.com', '+1-555-0107', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Rebranding Strategy', 15000, 'Low', 'Cold Email', 'Contacted', 'Boston, MA', 'www.reddit.com', 'Responded to cold outreach. Exploring options.', '4 days ago'),
('Flock', 'Rachel Green', 'rachel@flock.com', '+1-555-0108', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Rebranding Strategy', 35000, 'Medium', 'Referral', 'Qualified', 'Miami, FL', 'www.flock.com', 'Qualified lead with clear requirements.', '1 day ago'),
('Notion', 'David Kim', 'david@notion.com', '+1-555-0109', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Article', 47000, 'High', 'Website', 'Qualified', 'Portland, OR', 'www.notion.com', 'High-value prospect with established timeline.', '3 days ago'),
('Instagram', 'Chris Taylor', 'chris@instagram.com', '+1-555-0110', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Blog article', 34000, 'High', 'Social Media', 'Proposal made', 'San Diego, CA', 'www.instagram.com', 'Proposal submitted. Awaiting response.', '2 days ago'),
('Facebook', 'Amanda White', 'amanda@facebook.com', '+1-555-0111', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Software development', 28000, 'Medium', 'Partnership', 'Proposal made', 'Palo Alto, CA', 'www.facebook.com', 'Partnership proposal under review.', '4 days ago'),
('NFL', 'Michael Johnson', 'michael@nfl.com', '+1-555-0112', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Blog article', 44000, 'High', 'Partnership', 'Won', 'New York, NY', 'www.nfl.com', 'Successfully closed deal. Project starting soon.', '1 week ago'),
('PLD', 'Sophie Turner', 'sophie@pld.com', '+1-555-0113', '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png', 'Software development', 34000, 'Medium', 'Referral', 'Won', 'Denver, CO', 'www.pld.com', 'Completed project successfully.', '2 weeks ago');