import { format } from 'date-fns';

/**
 * Formats a date to "DD Month YYYY" format (e.g., "30 September 2025")
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    
    return format(dateObj, 'dd MMMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Formats a date to "DD/MM/YYYY" format (e.g., "30/09/2025")
 */
export const formatDateShort = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Formats a date with time to "DD Month YYYY HH:mm" format
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    
    return format(dateObj, 'dd MMMM yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};
