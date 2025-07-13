import { supabase } from '@/integrations/supabase/client';
import { testModuleAccess } from './modulePermissions';

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

/**
 * Comprehensive health check for module system
 */
export const moduleSystemHealthCheck = async (companyId: string): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];

  try {
    // 1. Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      results.push({
        status: 'error',
        message: 'Authentication failed',
        details: authError
      });
      return results;
    }

    results.push({
      status: 'healthy',
      message: 'User authentication verified'
    });

    // 2. Test database connectivity
    const { error: pingError } = await supabase.from('company_modules').select('id').limit(1);
    if (pingError) {
      results.push({
        status: 'error',
        message: 'Database connectivity failed',
        details: pingError
      });
    } else {
      results.push({
        status: 'healthy',
        message: 'Database connectivity verified'
      });
    }

    // 3. Test module access permissions
    try {
      const accessTest = await testModuleAccess(companyId);
      if (accessTest.canRead) {
        results.push({
          status: 'healthy',
          message: `Module read access verified (${accessTest.modulesCount} modules found)`
        });
      }

      if (accessTest.canModify) {
        results.push({
          status: 'healthy',
          message: 'Module modify permissions verified'
        });
      } else {
        results.push({
          status: 'warning',
          message: 'Limited permissions - cannot modify modules'
        });
      }
    } catch (error) {
      results.push({
        status: 'error',
        message: 'Module access test failed',
        details: error
      });
    }

    // 4. Test basic module operation
    try {
      // Try a simple select to verify RLS is working correctly
      const { data: testData, error: testError } = await supabase
        .from('company_modules')
        .select('id, module_name')
        .eq('company_id', companyId)
        .limit(1);

      if (!testError) {
        results.push({
          status: 'healthy',
          message: 'Module operations verified'
        });
      } else {
        results.push({
          status: 'error',
          message: 'Module operation test failed',
          details: testError
        });
      }
    } catch (error) {
      results.push({
        status: 'warning',
        message: 'Could not verify module operations',
        details: error
      });
    }

  } catch (error) {
    results.push({
      status: 'error',
      message: 'Health check failed',
      details: error
    });
  }

  return results;
};

/**
 * Quick diagnostic for module issues
 */
export const diagnoseModuleIssue = async (companyId: string, moduleName: string) => {
  const diagnostic = {
    companyId,
    moduleName,
    timestamp: new Date().toISOString(),
    issues: [] as string[],
    recommendations: [] as string[]
  };

  try {
    // Check if module exists
    const { data: module, error } = await supabase
      .from('company_modules')
      .select('*')
      .eq('company_id', companyId)
      .eq('module_name', moduleName)
      .maybeSingle();

    if (error) {
      diagnostic.issues.push(`Database error: ${error.message}`);
      if (error.code === '42501') {
        diagnostic.recommendations.push('Check RLS policies for company_modules table');
        diagnostic.recommendations.push('Verify user has proper company permissions');
      }
    }

    if (!module) {
      diagnostic.issues.push('Module record not found in database');
      diagnostic.recommendations.push('Initialize module using the initialize_company_modules function');
    }

    // Check user permissions
    const healthCheck = await moduleSystemHealthCheck(companyId);
    const errorResults = healthCheck.filter(r => r.status === 'error');
    if (errorResults.length > 0) {
      diagnostic.issues.push(...errorResults.map(r => r.message));
      diagnostic.recommendations.push('Resolve authentication and permission issues first');
    }

  } catch (error) {
    diagnostic.issues.push(`Diagnostic failed: ${(error as Error).message}`);
  }

  return diagnostic;
};