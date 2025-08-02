-- Create calendar integrations table
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'icloud')),
  provider_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  calendar_name TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_frequency_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider, calendar_id)
);

-- Create external calendar events table
CREATE TABLE IF NOT EXISTS external_calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES calendar_integrations(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, external_event_id)
);

-- Enable RLS on both tables
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_integrations
CREATE POLICY "Users can manage their own calendar integrations"
ON calendar_integrations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for external_calendar_events
CREATE POLICY "Users can view events from their integrations"
ON external_calendar_events
FOR SELECT
USING (integration_id IN (
  SELECT id FROM calendar_integrations WHERE user_id = auth.uid()
));

CREATE POLICY "System can manage external events"
ON external_calendar_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX idx_external_events_integration_id ON external_calendar_events(integration_id);
CREATE INDEX idx_external_events_start_time ON external_calendar_events(start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_calendar_events_updated_at
  BEFORE UPDATE ON external_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();