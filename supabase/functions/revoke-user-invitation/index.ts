import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RevokeInvitationRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Parse request
    const { email }: RevokeInvitationRequest = await req.json();
    console.log('Revoke invitation request received for email:', email?.substring(0, 3) + '***');

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get the requesting user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get the requesting user
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user has superadmin role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('User roles check:', { roles, roleError, userId: user.id });

    if (roleError || !roles?.some(r => r.role === 'superadmin')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only superadmins can revoke invitations.' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Find the user profile by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, status')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Profile lookup failed:', profileError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if user is in invited status
    if (profile.status !== 'invited') {
      return new Response(
        JSON.stringify({ error: 'User is not in invited status' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Update profile status to revoked
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    if (updateProfileError) {
      console.error('Failed to update profile status:', updateProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to revoke invitation' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Mark all invitation tokens for this user as used (effectively revoking them)
    const { error: tokenError } = await supabaseAdmin
      .from('user_access_tokens')
      .update({ 
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)
      .eq('token_type', 'invitation')
      .is('used_at', null);

    if (tokenError) {
      console.error('Failed to revoke tokens:', tokenError);
      // Don't fail the request since profile was already updated
      console.log('Profile status updated but token revocation failed');
    }

    console.log('Invitation successfully revoked for user:', profile.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation revoked successfully',
        email: email
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in revoke-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);