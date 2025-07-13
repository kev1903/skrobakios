import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateTokenRequest {
  userId: string;
  tokenType: 'activation' | 'password_reset' | 'temporary_access';
  expirationHours?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user making the request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is superadmin
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(role => role.role === 'superadmin');
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, tokenType, expirationHours = 24 }: GenerateTokenRequest = await req.json();

    if (!userId || !tokenType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId and tokenType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('generate_access_token');

    if (tokenError) {
      console.error('Error generating token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token_value = tokenData;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Store token in database
    const { data: accessToken, error: insertError } = await supabaseAdmin
      .from('user_access_tokens')
      .insert({
        user_id: userId,
        token: token_value,
        token_type: tokenType,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing access token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate access URL
    const baseUrl = req.headers.get('origin') || 'https://your-app.com';
    const accessUrl = `${baseUrl}/?token=${token_value}&type=${tokenType}`;

    console.log(`Generated ${tokenType} token for user ${userId}`, {
      tokenId: accessToken.id,
      expiresAt: expiresAt.toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        token: token_value,
        tokenId: accessToken.id,
        accessUrl,
        expiresAt: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-access-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);