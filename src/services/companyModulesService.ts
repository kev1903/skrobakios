import { supabase } from '@/integrations/supabase/client';
import { CompanyModule } from '@/types/companyModules';
import { moduleCache, createCacheKey, warmCache } from '@/utils/enhancedCache';
import { queryOptimizer } from '@/utils/queryOptimizer';
import { measureQuery, performanceMonitor } from '@/utils/performanceMonitor';
import { backgroundProcessor } from '@/utils/backgroundProcessor';
import { validateModulePermissions } from '@/utils/modulePermissions';

// Track active requests to prevent duplicate calls
const activeRequests = new Map<string, Promise<CompanyModule[]>>();

export const fetchCompanyModulesInternal = async (companyId: string, retryCount = 0): Promise<CompanyModule[]> => {
  return measureQuery('fetchCompanyModules', async () => {
    const cacheKey = createCacheKey('company_modules', companyId);
    
    // Check cache first
    const cachedData = moduleCache.get(cacheKey) as CompanyModule[];
    if (cachedData) {
      console.log('Using cached modules data for company:', companyId);
      performanceMonitor.recordMetric('cache.hit', 0, { type: 'company_modules', companyId });
      return cachedData;
    }

    // Check if there's already an active request for this company
    if (activeRequests.has(companyId)) {
      return activeRequests.get(companyId)!;
    }

    const requestPromise = (async () => {
      const { data, error } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;
      return data as CompanyModule[];
    })();

    activeRequests.set(companyId, requestPromise);
    
    try {
      const moduleData = await requestPromise;
      moduleCache.set(cacheKey, moduleData);
      backgroundProcessor.prefetchData([companyId], 'company_modules');
      return moduleData;
    } catch (error) {
      performanceMonitor.recordMetric('cache.miss', 1, { type: 'company_modules', companyId, error: true });
      throw error;
    } finally {
      activeRequests.delete(companyId);
    }
  });
};

export const fetchMultipleCompanyModulesInternal = async (companyIds: string[]): Promise<CompanyModule[]> => {
  if (companyIds.length === 0) return [];
  
  return measureQuery('fetchMultipleCompanyModules', async () => {
    console.log('Fetching modules for multiple companies:', companyIds);

    // Filter out companies that have valid cached data
    const uncachedCompanyIds = companyIds.filter(id => {
      const cacheKey = createCacheKey('company_modules', id);
      return !moduleCache.has(cacheKey);
    });
    
    if (uncachedCompanyIds.length === 0) {
      console.log('All companies have valid cached data');
      // Use cached data for all companies
      return companyIds.flatMap(id => {
        const cacheKey = createCacheKey('company_modules', id);
        return moduleCache.get(cacheKey) || [];
      });
    }

    // Use batch query optimization for better performance
    const queries = uncachedCompanyIds.map(id => ({
      table: 'company_modules',
      query: '*',
      key: id
    }));

    const batchResults = await queryOptimizer.batchQuery<CompanyModule>(queries, {
      batchSize: 5, // Process 5 companies at a time
      cacheTtl: 300000 // 5 minutes cache
    });

    // Combine cached and newly fetched data
    const allModules: CompanyModule[] = [];
    
    // Add cached data
    companyIds.forEach(id => {
      const cacheKey = createCacheKey('company_modules', id);
      if (moduleCache.has(cacheKey)) {
        const cached = moduleCache.get(cacheKey);
        if (cached) allModules.push(...cached);
      }
    });
    
    // Add newly fetched data
    Object.entries(batchResults).forEach(([companyId, modules]) => {
      if (modules) {
        allModules.push(...modules);
        // Update individual cache entries
        const cacheKey = createCacheKey('company_modules', companyId);
        moduleCache.set(cacheKey, modules);
      }
    });
    
    // Schedule background cache warming for frequently accessed companies
    backgroundProcessor.warmCache(
      createCacheKey('batch_warm', companyIds.join(',')),
      async () => warmCache(companyIds, fetchCompanyModulesInternal)
    );
    
    return allModules;
  });
};

export const updateModuleStatusInternal = async (companyId: string, moduleName: string, enabled: boolean): Promise<CompanyModule> => {
  return measureQuery('updateModuleStatus', async () => {
    // Validate permissions before attempting the update
    await validateModulePermissions(companyId, 'modify');
    
    console.log(`Updating module ${moduleName} to ${enabled} for company ${companyId}`);
    
    const { data, error } = await supabase
      .from('company_modules')
      .upsert({
        company_id: companyId,
        module_name: moduleName,
        enabled: enabled
      }, {
        onConflict: 'company_id,module_name'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Track database error for performance monitoring
      performanceMonitor.recordMetric('database.error', 1, { 
        operation: 'update_module', 
        companyId, 
        error: error.code 
      });
      
      throw error;
    }
    
    console.log('Successfully updated module:', data);

    // Update cache efficiently
    const cacheKey = createCacheKey('company_modules', companyId);
    const cached = moduleCache.get(cacheKey);
    if (cached) {
      const updatedData = cached.map(m => 
        m.module_name === moduleName ? { ...m, enabled } : m
      );
      if (!cached.find(m => m.module_name === moduleName)) {
        updatedData.push(data);
      }
      moduleCache.set(cacheKey, updatedData);
    }

    // Track successful update
    performanceMonitor.recordMetric('module.update', 1, { 
      companyId, 
      moduleName, 
      enabled 
    });

    // Schedule background analytics tracking
    backgroundProcessor.trackAnalytics('module_updated', { 
      companyId, 
      moduleName, 
      enabled, 
      timestamp: Date.now() 
    });

    return data;
  });
};