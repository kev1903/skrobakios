/**
 * Formats a number as currency with proper comma separators
 * @param amount - The amount to format
 * @param currency - The currency code (default: AUD)
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'AUD', showSymbol: boolean = true): string => {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[,$]/g, '')) : amount;
  
  if (isNaN(numericAmount)) return '$0.00';
  
  const formatted = numericAmount.toLocaleString('en-AU', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // If not showing symbol but we got a currency format, remove the symbol
  if (!showSymbol && formatted.startsWith('$')) {
    return formatted.substring(1);
  }
  
  return formatted;
};

/**
 * Formats a number with commas as thousand separators
 * @param amount - The number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') return '0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[,$]/g, '')) : amount;
  
  if (isNaN(numericAmount)) return '0.00';
  
  return numericAmount.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formats currency for display with "Inc GST" suffix
 * @param amount - The amount to format
 * @param currency - The currency code (default: AUD)
 * @returns Formatted currency string with Inc GST
 */
export const formatCurrencyWithGST = (amount: number | string | null | undefined, currency: string = 'AUD'): string => {
  const formatted = formatCurrency(amount, currency);
  return `${formatted} Inc GST`;
};

/**
 * Parses a formatted currency string back to a number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};