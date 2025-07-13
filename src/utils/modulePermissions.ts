import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user can manage modules for a company
 */
export const canManageCompanyModules = async (companyId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user is a company admin or owner
    const { data: result, error } = await supabase
      .rpc('is_company_admin_or_owner', {
        target_company_id: companyId,
        target_user_id: user.id
      });

    if (error) {
      console.error('Error checking permissions:', error);
      return false;
    }

    return result || false;
  } catch (error) {
    console.error('Error in canManageCompanyModules:', error);
    return false;
  }
};

/**
 * Validate module permissions before attempting operations
 */
export const validateModulePermissions = async (companyId: string, operation: 'view' | 'modify') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  if (operation === 'modify') {
    const canManage = await canManageCompanyModules(companyId);
    if (!canManage) {
      throw new Error('Insufficient permissions to modify company modules');
    }
  }

  return true;
};

/**
 * Test database connectivity and permissions
 */
export const testModuleAccess = async (companyId: string) => {
  try {
    // Test read access
    const { data, error: readError } = await supabase
      .from('company_modules')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);

    if (readError) {
      throw new Error(`Read access failed: ${readError.message}`);
    }

    // Test if user can manage modules
    const canModify = await canManageCompanyModules(companyId);
    
    return {
      canRead: true,
      canModify,
      modulesCount: data?.length || 0
    };
  } catch (error) {
    console.error('Module access test failed:', error);
    throw error;
  }
};