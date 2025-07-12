import { supabase } from '@/integrations/supabase/client';
import { CompanyModule } from '@/types/companyModules';
import { getCachedData, setCacheData, isCacheValid } from '@/utils/moduleCache';

// Track active requests to prevent duplicate calls
const activeRequests = new Map<string, Promise<CompanyModule[]>>();

export const fetchCompanyModulesInternal = async (companyId: string, retryCount = 0): Promise<CompanyModule[]> => {
  // Check cache first
  const cachedData = getCachedData(companyId);
  if (cachedData) {
    console.log('Using cached modules data for company:', companyId);
    return cachedData;
  }

  // Check if there's already an active request for this company
  if (activeRequests.has(companyId)) {
    console.log('Reusing existing request for company:', companyId);
    return activeRequests.get(companyId)!;
  }

  console.log('Fetching modules data for company:', companyId);

  const requestPromise = (async () => {
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', companyId);

      if (error) {
        console.error('Error fetching modules:', error);
        throw error;
      }

      const moduleData = data || [];
      console.log('Successfully fetched modules data for company:', companyId, moduleData);
      
      // Cache the successful response
      setCacheData(companyId, moduleData);
      
      return moduleData;
    } catch (error) {
      console.error('Error fetching company modules:', error);
      
      // Implement retry logic for network errors
      if ((error as any)?.message?.includes('Failed to fetch') && retryCount < 2) {
        console.log(`Retrying fetch for company ${companyId}, attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return fetchCompanyModulesInternal(companyId, retryCount + 1);
      }
      
      throw error;
    } finally {
      // Remove from active requests
      activeRequests.delete(companyId);
    }
  })();

  // Store the active request
  activeRequests.set(companyId, requestPromise);
  
  return requestPromise;
};

export const fetchMultipleCompanyModulesInternal = async (companyIds: string[]): Promise<CompanyModule[]> => {
  if (companyIds.length === 0) return [];
  
  console.log('Fetching modules for multiple companies:', companyIds);

  // Filter out companies that have valid cached data
  const uncachedCompanyIds = companyIds.filter(id => !isCacheValid(id));
  
  if (uncachedCompanyIds.length === 0) {
    console.log('All companies have valid cached data');
    // Use cached data for all companies
    return companyIds.flatMap(id => getCachedData(id) || []);
  }

  // Fetch data for uncached companies in parallel
  const fetchPromises = uncachedCompanyIds.map(id => fetchCompanyModulesInternal(id));
  const results = await Promise.allSettled(fetchPromises);
  
  // Combine cached and newly fetched data
  const allModules: CompanyModule[] = [];
  
  // Add cached data
  companyIds.forEach(id => {
    if (isCacheValid(id)) {
      const cached = getCachedData(id);
      if (cached) allModules.push(...cached);
    }
  });
  
  // Add newly fetched data
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allModules.push(...result.value);
    } else {
      console.error(`Failed to fetch modules for company ${uncachedCompanyIds[index]}:`, result.reason);
    }
  });
  
  return allModules;
};

export const updateModuleStatusInternal = async (companyId: string, moduleName: string, enabled: boolean): Promise<CompanyModule> => {
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
    throw error;
  }

  // Update cache
  const cached = getCachedData(companyId);
  if (cached) {
    const updatedData = cached.map(m => 
      m.module_name === moduleName ? { ...m, enabled } : m
    );
    if (!cached.find(m => m.module_name === moduleName)) {
      updatedData.push(data);
    }
    setCacheData(companyId, updatedData);
  }

  return data;
};