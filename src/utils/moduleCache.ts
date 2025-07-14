import { CompanyModule } from '@/types/companyModules';
import { moduleCache, createCacheKey } from './enhancedCache';

// Backward compatibility functions for existing code
export const isCacheValid = (companyId: string): boolean => {
  const cacheKey = createCacheKey('company_modules', companyId);
  return moduleCache.has(cacheKey);
};

export const getCachedData = (companyId: string): CompanyModule[] | null => {
  const cacheKey = createCacheKey('company_modules', companyId);
  return moduleCache.get(cacheKey);
};

export const setCacheData = (companyId: string, data: CompanyModule[]) => {
  const cacheKey = createCacheKey('company_modules', companyId);
  moduleCache.set(cacheKey, data);
};

export const clearCache = (companyId?: string) => {
  if (companyId) {
    const cacheKey = createCacheKey('company_modules', companyId);
    moduleCache.delete(cacheKey);
  } else {
    moduleCache.clear();
  }
};