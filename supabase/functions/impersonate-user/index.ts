import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImpersonateRequest {
  targetUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting impersonation request...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the requesting user's session
    console.log('Verifying user session...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      console.error('User data:', user);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.email);

    // Check if the requesting user is a superadmin
    console.log('Checking user roles for user:', user.id);
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('User roles query result:', { userRoles, rolesError });

    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Error checking permissions', details: rolesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isSuperAdmin = userRoles?.some(ur => ur.role === 'superadmin');
    console.log('Is superadmin?', isSuperAdmin, 'User roles:', userRoles);
    
    if (!isSuperAdmin) {
      console.error('User is not a superadmin');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only superadmins can impersonate users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    console.log('Parsing request body...');
    let targetUserId: string;
    try {
      const body = await req.json();
      console.log('Request body:', body);
      targetUserId = body.targetUserId;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetUserId) {
      console.error('No target user ID provided');
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Target user ID:', targetUserId);

    // Verify the target user exists
    console.log('Looking up target user profile...');
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name')
      .eq('user_id', targetUserId)
      .single();

    console.log('Target profile query result:', { targetProfile, profileError });

    if (profileError || !targetProfile) {
      console.error('Error finding target user:', profileError);
      return new Response(
        JSON.stringify({ error: 'Target user not found', details: profileError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a temporary access token
    console.log('Generating access token...');
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_access_token');
    
    console.log('Token generation result:', { tokenData, tokenError });
    
    if (tokenError || !tokenData) {
      console.error('Error generating access token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate access token', details: tokenError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the token in the user_access_tokens table
    console.log('Storing access token...');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const { error: insertError } = await supabase
      .from('user_access_tokens')
      .insert({
        user_id: targetUserId,
        token: tokenData,
        token_type: 'impersonation',
        expires_at: expiresAt.toISOString()
      });

    console.log('Token storage result:', { insertError });

    if (insertError) {
      console.error('Error storing access token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store access token', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the impersonation URL
    const baseUrl = req.headers.get('origin') || supabaseUrl.replace('/rest/v1', '');
    const impersonationUrl = `${baseUrl}/impersonate?token=${tokenData}`;

    console.log(`Superadmin ${user.email} is impersonating user ${targetProfile.email}`);
    console.log('Impersonation URL:', impersonationUrl);

    return new Response(
      JSON.stringify({
        success: true,
        impersonationUrl,
        targetUser: {
          id: targetProfile.user_id,
          email: targetProfile.email,
          name: `${targetProfile.first_name || ''} ${targetProfile.last_name || ''}`.trim()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in impersonate-user function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);