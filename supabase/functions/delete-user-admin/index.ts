import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: missing SUPABASE envs' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify current user permissions
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the requesting user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has superadmin role using SECURITY DEFINER RPC to avoid RLS recursion
    const { data: isSuperadmin, error: isSuperadminError } = await supabase
      .rpc('is_superadmin', { target_user_id: user.id });

    console.log('is_superadmin RPC result:', { isSuperadmin, isSuperadminError, userId: user.id });

    if (isSuperadminError) {
      console.error('Role check error (RPC):', isSuperadminError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify permissions', details: isSuperadminError.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isSuperadmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions. Only superadmins can delete users.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user ID or email from request
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Raw request body:', requestBody);
    
    const { targetUserId } = requestBody;
    
    console.log('Extracted targetUserId:', targetUserId);
    console.log('Delete request for user:', targetUserId);
    
    if (!targetUserId || targetUserId === 'null' || targetUserId === 'undefined') {
      console.error('Missing or invalid targetUserId in request body:', requestBody);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Target user ID is required and cannot be null.', 
          receivedBody: requestBody 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if targetUserId is a UUID or an email address
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
    
    if (!isUuid) {
      // Handle invited/revoked users who only have email records but no auth user
      console.log('Handling deletion for invited/revoked user with email:', targetUserId);
      
      // Delete profile record by email
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('email', targetUserId);

      console.log('Profile deletion result for email:', { profileDeleteError });

      if (profileDeleteError) {
        console.error('Error deleting profile by email:', profileDeleteError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete user profile', details: profileDeleteError.message }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invited/revoked user successfully removed',
          deletedEmail: targetUserId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prevent self-deletion
    if (targetUserId === user.id) {
      console.log('Attempted self-deletion blocked');
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot delete your own account' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Starting user deletion process for:', targetUserId);

    // First, delete all user data from database using our function
    const { data: deleteResult, error: deleteError } = await supabaseAdmin
      .rpc('delete_user_completely', { target_user_id: targetUserId })

    console.log('Database deletion result:', { deleteResult, deleteError });

    if (deleteError) {
      console.error('Error deleting user data:', deleteError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete user data', details: deleteError.message }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User data deleted successfully, now deleting auth user...');

    // Then delete the user from auth.users (this also revokes all sessions)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    console.log('Auth deletion result:', { authDeleteError });

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User data deleted but failed to revoke authentication', 
          details: authDeleteError.message 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User completely deleted and authentication revoked',
        deletedUserId: targetUserId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: error.message }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})