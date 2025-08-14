import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProjectCostSettings, 
  getProjectCostSettings, 
  formatProjectCurrency,
  formatProjectDate,
  generateInvoiceNumber
} from '@/config/projectSettings';

interface UseProjectSettingsReturn {
  settings: ProjectCostSettings;
  loading: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  generateInvoiceNum: (sequence: number, date?: Date) => string;
  generateBillNum: (sequence: number, date?: Date) => string;
  refreshSettings: () => Promise<void>;
}

/**
 * Hook to manage project-specific cost settings
 * Provides consistent formatting and configuration across components
 */
export function useProjectSettings(
  projectId?: string, 
  companyId?: string
): UseProjectSettingsReturn {
  const [settings, setSettings] = useState<ProjectCostSettings>(getProjectCostSettings());
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    if (!projectId && !companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to get company-specific settings first
      let companySettings = null;
      if (companyId) {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, address, business_type')
          .eq('id', companyId)
          .single();

        if (company) {
          // Extract country from address or use business type for regional settings
          const countryCode = extractCountryCode(company.address);
          companySettings = { countryCode };
        }
      }

      // Check for project-specific settings in system_configurations
      let projectSettings = null;
      if (projectId) {
        const { data: configs } = await supabase
          .from('system_configurations')
          .select('config_value')
          .eq('config_key', `project_cost_settings_${projectId}`)
          .single();

        if (configs?.config_value) {
          projectSettings = configs.config_value as Partial<ProjectCostSettings>;
        }
      }

      // Combine settings with precedence: project > company > regional > default
      const finalSettings = getProjectCostSettings(
        companySettings?.countryCode,
        projectSettings
      );

      setSettings(finalSettings);
    } catch (error) {
      console.error('Error loading project settings:', error);
      // Use default settings on error
      setSettings(getProjectCostSettings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [projectId, companyId]);

  // Helper function to extract country code from address
  const extractCountryCode = (address?: string): string | undefined => {
    if (!address) return undefined;
    
    const addressLower = address.toLowerCase();
    if (addressLower.includes('australia') || addressLower.includes('au')) return 'AU';
    if (addressLower.includes('united states') || addressLower.includes('usa') || addressLower.includes('us')) return 'US';
    if (addressLower.includes('united kingdom') || addressLower.includes('uk') || addressLower.includes('britain')) return 'GB';
    if (addressLower.includes('canada') || addressLower.includes('ca')) return 'CA';
    
    return undefined;
  };

  // Formatting functions using project settings
  const formatCurrency = (amount: number): string => {
    return formatProjectCurrency(amount, settings);
  };

  const formatDate = (date: Date | string): string => {
    return formatProjectDate(date, settings);
  };

  const generateInvoiceNum = (sequence: number, date: Date = new Date()): string => {
    return generateInvoiceNumber(settings.invoiceNumberFormat, sequence, date);
  };

  const generateBillNum = (sequence: number, date: Date = new Date()): string => {
    return generateInvoiceNumber(settings.billNumberFormat, sequence, date);
  };

  return {
    settings,
    loading,
    formatCurrency,
    formatDate,
    generateInvoiceNum,
    generateBillNum,
    refreshSettings: loadSettings
  };
}