import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlatformActionRequest {
  action: string;
  payload: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Set the auth context
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    })

    // Verify user is authenticated and is superadmin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is superadmin
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (roleError) {
      throw new Error('Failed to verify user permissions')
    }

    const isSuperAdmin = userRoles?.some(r => r.role === 'superadmin')
    if (!isSuperAdmin) {
      throw new Error('Insufficient permissions - superadmin required')
    }

    const { action, payload }: PlatformActionRequest = await req.json()

    console.log(`Platform action requested: ${action}`, payload)

    let result: any = {}

    switch (action) {
      case 'get_platform_stats':
        // Get platform-wide statistics
        const [
          { count: totalUsers },
          { count: totalCompanies },
          { count: totalProjects },
          { count: activeUsers }
        ] = await Promise.all([
          supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
          supabaseClient.from('companies').select('*', { count: 'exact', head: true }),
          supabaseClient.from('projects').select('*', { count: 'exact', head: true }),
          supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ])

        result = {
          totalUsers: totalUsers || 0,
          totalCompanies: totalCompanies || 0,
          totalProjects: totalProjects || 0,
          activeUsers: activeUsers || 0
        }
        break

      case 'update_feature_flag':
        const { flagId, updates } = payload
        const { error: flagError } = await supabaseClient
          .from('feature_flags')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
          })
          .eq('id', flagId)

        if (flagError) throw flagError

        // Log the action
        await supabaseClient
          .from('platform_audit_logs')
          .insert([{
            action_type: 'UPDATE_FEATURE_FLAG',
            resource_type: 'feature_flags',
            resource_id: flagId,
            user_id: user.id,
            action_details: updates,
            severity_level: 'info'
          }])

        result = { success: true }
        break

      case 'create_maintenance_window':
        const { maintenanceData } = payload
        const { error: maintenanceError } = await supabaseClient
          .from('maintenance_windows')
          .insert([{
            ...maintenanceData,
            created_by: user.id
          }])

        if (maintenanceError) throw maintenanceError

        // Log the action
        await supabaseClient
          .from('platform_audit_logs')
          .insert([{
            action_type: 'CREATE_MAINTENANCE_WINDOW',
            resource_type: 'maintenance_windows',
            user_id: user.id,
            action_details: maintenanceData,
            severity_level: 'warning'
          }])

        result = { success: true }
        break

      case 'toggle_company_verification':
        const { companyId, verified } = payload
        const { error: companyError } = await supabaseClient
          .from('companies')
          .update({ verified: !verified })
          .eq('id', companyId)

        if (companyError) throw companyError

        // Log the action
        await supabaseClient
          .from('platform_audit_logs')
          .insert([{
            action_type: verified ? 'UNVERIFY_COMPANY' : 'VERIFY_COMPANY',
            resource_type: 'companies',
            resource_id: companyId,
            user_id: user.id,
            action_details: { previous_status: verified, new_status: !verified },
            severity_level: 'info'
          }])

        result = { success: true }
        break

      case 'create_company_override':
        const { overrideData } = payload
        const { error: overrideError } = await supabaseClient
          .from('company_overrides')
          .insert([{
            ...overrideData,
            created_by: user.id
          }])

        if (overrideError) throw overrideError

        // Log the action
        await supabaseClient
          .from('platform_audit_logs')
          .insert([{
            action_type: 'CREATE_COMPANY_OVERRIDE',
            resource_type: 'company_overrides',
            user_id: user.id,
            action_details: overrideData,
            severity_level: 'warning'
          }])

        result = { success: true }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Platform management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})