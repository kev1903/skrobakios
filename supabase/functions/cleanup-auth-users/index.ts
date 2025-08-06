import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authorization header to verify superadmin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the requesting user is a superadmin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is superadmin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !userRoles?.some(r => r.role === 'superadmin')) {
      throw new Error('Insufficient permissions - superadmin required');
    }

    const superadminUserId = user.id;
    const superadminEmail = user.email;
    
    console.log('Starting cleanup for superadmin:', superadminEmail);

    // Get all users from auth
    const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    console.log(`Found ${allUsers.users.length} total auth users`);

    let deletedCount = 0;
    const deleteErrors = [];

    // Delete all users except the superadmin
    for (const authUser of allUsers.users) {
      if (authUser.id !== superadminUserId) {
        console.log(`Deleting auth user: ${authUser.email} (${authUser.id})`);
        
        try {
          // Delete from auth.users
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          
          if (deleteError) {
            console.error(`Failed to delete auth user ${authUser.email}:`, deleteError);
            deleteErrors.push(`${authUser.email}: ${deleteError.message}`);
          } else {
            deletedCount++;
            console.log(`Successfully deleted auth user: ${authUser.email}`);
          }
        } catch (error) {
          console.error(`Error deleting auth user ${authUser.email}:`, error);
          deleteErrors.push(`${authUser.email}: ${error.message}`);
        }
      }
    }

    // Also clean up any orphaned profiles
    const { error: profileCleanupError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .neq('user_id', superadminUserId);

    if (profileCleanupError) {
      console.error('Error cleaning up profiles:', profileCleanupError);
    }

    // Clean up any orphaned user roles
    const { error: rolesCleanupError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .neq('user_id', superadminUserId);

    if (rolesCleanupError) {
      console.error('Error cleaning up user roles:', rolesCleanupError);
    }

    const result = {
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} auth users. Kept superadmin: ${superadminEmail}`,
      deletedCount,
      errors: deleteErrors,
      keptUser: {
        id: superadminUserId,
        email: superadminEmail
      }
    };

    console.log('Cleanup result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in cleanup function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);