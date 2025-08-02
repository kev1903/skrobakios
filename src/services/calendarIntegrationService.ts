import { supabase } from '@/integrations/supabase/client';

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'icloud';
  provider_user_id: string;
  calendar_name: string;
  sync_enabled: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  external_event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  attendees: Array<{ email: string; name: string }>;
  status: string;
}

class CalendarIntegrationService {
  private baseUrl: string;

  constructor() {
    // Get the project URL
    const supabaseUrl = 'https://xtawnkhvxgxylhxwqnmm.supabase.co';
    this.baseUrl = `${supabaseUrl}/functions/v1`;
  }

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async connectOutlook(): Promise<{ authUrl: string; state: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/outlook-calendar-sync?action=auth-url`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get authorization URL');
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      throw error;
    }
  }

  async syncOutlookCalendar(): Promise<{ success: boolean; syncedEvents: number; totalEvents: number }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/outlook-calendar-sync?action=sync`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing Outlook calendar:', error);
      throw error;
    }
  }

  async disconnectOutlook(): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/outlook-calendar-sync?action=disconnect`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error disconnecting Outlook calendar:', error);
      throw error;
    }
  }

  async getIntegrations(): Promise<CalendarIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('id, provider, provider_user_id, calendar_name, sync_enabled, last_sync_at, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CalendarIntegration[];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }

  async getCalendarEvents(integrationId?: string): Promise<CalendarEvent[]> {
    try {
      let query = supabase
        .from('external_calendar_events')
        .select('id, external_event_id, title, description, start_time, end_time, location, attendees, status')
        .order('start_time', { ascending: true });

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(event => ({
        ...event,
        attendees: Array.isArray(event.attendees) ? event.attendees as Array<{ email: string; name: string }> : []
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async updateIntegrationSettings(integrationId: string, settings: { 
    sync_enabled?: boolean; 
    sync_frequency_minutes?: number; 
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('calendar_integrations')
        .update(settings)
        .eq('id', integrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating integration settings:', error);
      throw error;
    }
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();