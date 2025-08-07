import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string | null;
  is_sensitive: boolean;
  requires_restart: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  flag_name: string;
  flag_key: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  target_users: any;
  target_companies: any;
  conditions: any;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  maintenance_type: string;
  affected_services: any;
  status: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyOverride {
  id: string;
  company_id: string;
  override_type: string;
  override_key: string;
  override_value: any;
  reason: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [companyOverrides, setCompanyOverrides] = useState<CompanyOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlatformSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_type', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching platform settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch platform settings",
        variant: "destructive"
      });
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name', { ascending: true });

      if (error) throw error;
      setFeatureFlags(data || []);
    } catch (error: any) {
      console.error('Error fetching feature flags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feature flags",
        variant: "destructive"
      });
    }
  };

  const fetchMaintenanceWindows = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .select('*')
        .order('scheduled_start', { ascending: false });

      if (error) throw error;
      setMaintenanceWindows(data || []);
    } catch (error: any) {
      console.error('Error fetching maintenance windows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance windows",
        variant: "destructive"
      });
    }
  };

  const fetchCompanyOverrides = async () => {
    try {
      const { data, error } = await supabase
        .from('company_overrides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanyOverrides(data || []);
    } catch (error: any) {
      console.error('Error fetching company overrides:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company overrides",
        variant: "destructive"
      });
    }
  };

  const updatePlatformSetting = async (settingKey: string, value: any) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
          last_modified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Log the action - we'll implement this via direct insert for now
      await supabase
        .from('platform_audit_logs')
        .insert([{
          action_type: 'UPDATE_SETTING',
          resource_type: 'platform_settings',
          action_details: { setting_key: settingKey, new_value: value },
          severity_level: 'info'
        }]);

      await fetchPlatformSettings();
      toast({
        title: "Success",
        description: "Platform setting updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating platform setting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update platform setting",
        variant: "destructive"
      });
    }
  };

  const updateFeatureFlag = async (flagId: string, updates: Partial<FeatureFlag>) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_modified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', flagId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('platform_audit_logs')
        .insert([{
          action_type: 'UPDATE_FEATURE_FLAG',
          resource_type: 'feature_flags',
          resource_id: flagId,
          action_details: updates,
          severity_level: 'info'
        }]);

      await fetchFeatureFlags();
      toast({
        title: "Success",
        description: "Feature flag updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update feature flag",
        variant: "destructive"
      });
    }
  };

  const createMaintenanceWindow = async (maintenanceData: Omit<MaintenanceWindow, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('maintenance_windows')
        .insert([{
          ...maintenanceData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      // Log the action
      await supabase
        .from('platform_audit_logs')
        .insert([{
          action_type: 'CREATE_MAINTENANCE_WINDOW',
          resource_type: 'maintenance_windows',
          action_details: maintenanceData,
          severity_level: 'info'
        }]);

      await fetchMaintenanceWindows();
      toast({
        title: "Success",
        description: "Maintenance window created successfully"
      });
    } catch (error: any) {
      console.error('Error creating maintenance window:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance window",
        variant: "destructive"
      });
    }
  };

  const createCompanyOverride = async (overrideData: Omit<CompanyOverride, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('company_overrides')
        .insert([{
          ...overrideData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      // Log the action
      await supabase
        .from('platform_audit_logs')
        .insert([{
          action_type: 'CREATE_COMPANY_OVERRIDE',
          resource_type: 'company_overrides',
          action_details: overrideData,
          severity_level: 'info'
        }]);

      await fetchCompanyOverrides();
      toast({
        title: "Success",
        description: "Company override created successfully"
      });
    } catch (error: any) {
      console.error('Error creating company override:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create company override",
        variant: "destructive"
      });
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPlatformSettings(),
      fetchFeatureFlags(),
      fetchMaintenanceWindows(),
      fetchCompanyOverrides()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    settings,
    featureFlags,
    maintenanceWindows,
    companyOverrides,
    loading,
    updatePlatformSetting,
    updateFeatureFlag,
    createMaintenanceWindow,
    createCompanyOverride,
    refreshData: loadAllData
  };
};