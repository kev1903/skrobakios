import { CompanyModule } from '@/types/companyModules';

// Global cache for company modules
const moduleCache = new Map<string, { data: CompanyModule[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check if cached data is still valid
export const isCacheValid = (companyId: string): boolean => {
  const cached = moduleCache.get(companyId);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
};

// Get cached data
export const getCachedData = (companyId: string): CompanyModule[] | null => {
  if (!isCacheValid(companyId)) return null;
  return moduleCache.get(companyId)?.data || null;
};

// Set cache data
export const setCacheData = (companyId: string, data: CompanyModule[]) => {
  moduleCache.set(companyId, { data, timestamp: Date.now() });
};

// Clear cache for a specific company or all companies
export const clearCache = (companyId?: string) => {
  if (companyId) {
    moduleCache.delete(companyId);
  } else {
    moduleCache.clear();
  }
};