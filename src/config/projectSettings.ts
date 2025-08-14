// Project-wide configuration settings to ensure consistency across all projects

export interface ProjectCostSettings {
  defaultCurrency: string;
  currencyLocale: string;
  defaultTaxRate: number;
  dateFormat: string;
  invoiceNumberFormat: string;
  billNumberFormat: string;
  fiscalYearStart: number; // Month (1-12)
  defaultPaymentTerms: number; // Days
  costCategories: string[];
  stages: string[];
}

// Default configuration - can be overridden per company/project
export const DEFAULT_COST_SETTINGS: ProjectCostSettings = {
  defaultCurrency: 'AUD',
  currencyLocale: 'en-AU',
  defaultTaxRate: 10, // 10% GST for Australia
  dateFormat: 'dd/MM/yyyy',
  invoiceNumberFormat: 'INV-{YEAR}-{SEQUENCE}',
  billNumberFormat: 'BILL-{YEAR}-{SEQUENCE}',
  fiscalYearStart: 7, // July for Australian financial year
  defaultPaymentTerms: 30,
  costCategories: [
    'Labour',
    'Materials',
    'Equipment',
    'Subcontractors',
    'Travel & Expenses',
    'Professional Services',
    'Insurance',
    'Permits & Fees',
    'Utilities',
    'Other'
  ],
  stages: [
    '1.0 FEASIBILITY',
    '2.0 CONCEPT DESIGN',
    '3.0 SCHEMATIC DESIGN',
    '4.0 PRELIMINARY',
    '5.0 DESIGN DEVELOPMENT',
    '6.0 CONSTRUCTION DOCUMENTATION',
    '7.0 TENDER DOCUMENTATION',
    '8.0 CONSTRUCTION',
    '9.0 POST CONSTRUCTION'
  ]
};

// Regional configurations
export const REGIONAL_SETTINGS: Record<string, Partial<ProjectCostSettings>> = {
  'AU': {
    defaultCurrency: 'AUD',
    currencyLocale: 'en-AU',
    defaultTaxRate: 10,
    fiscalYearStart: 7
  },
  'US': {
    defaultCurrency: 'USD',
    currencyLocale: 'en-US',
    defaultTaxRate: 0, // Varies by state
    fiscalYearStart: 1
  },
  'GB': {
    defaultCurrency: 'GBP',
    currencyLocale: 'en-GB',
    defaultTaxRate: 20, // VAT
    fiscalYearStart: 4
  },
  'CA': {
    defaultCurrency: 'CAD',
    currencyLocale: 'en-CA',
    defaultTaxRate: 13, // HST in Ontario
    fiscalYearStart: 1
  }
};

/**
 * Get project cost settings for a specific project/company
 * Falls back to regional settings based on company location
 */
export function getProjectCostSettings(
  companyLocation?: string,
  customSettings?: Partial<ProjectCostSettings>
): ProjectCostSettings {
  // Start with default settings
  let settings = { ...DEFAULT_COST_SETTINGS };
  
  // Apply regional settings if available
  if (companyLocation && REGIONAL_SETTINGS[companyLocation]) {
    settings = { ...settings, ...REGIONAL_SETTINGS[companyLocation] };
  }
  
  // Apply custom settings
  if (customSettings) {
    settings = { ...settings, ...customSettings };
  }
  
  return settings;
}

/**
 * Format currency consistently across the application
 */
export function formatProjectCurrency(
  amount: number, 
  settings: ProjectCostSettings
): string {
  return new Intl.NumberFormat(settings.currencyLocale, {
    style: 'currency',
    currency: settings.defaultCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date consistently across the application
 */
export function formatProjectDate(
  date: Date | string,
  settings: ProjectCostSettings
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(settings.currencyLocale);
}

/**
 * Generate consistent invoice/bill numbers
 */
export function generateInvoiceNumber(
  format: string,
  sequence: number,
  date: Date = new Date()
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const paddedSequence = String(sequence).padStart(6, '0');
  
  return format
    .replace('{YEAR}', String(year))
    .replace('{MONTH}', month)
    .replace('{SEQUENCE}', paddedSequence);
}