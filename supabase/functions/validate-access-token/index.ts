import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { validateRequest, safeParseJson, isValidUUID, checkRateLimit, getSecureHeaders } from "../_shared/security.ts";

const corsHeaders = getSecureHeaders();

interface ValidateTokenRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation
    const validation = validateRequest(req, {
      maxRequestSize: 1000, // Small limit for token requests
      rateLimitPerMinute: 10
    });
    
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: validation.statusCode || 400, headers: corsHeaders }
      );
    }

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`token-validation:${clientIP}`, 10)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate the request body
    const bodyText = await req.text();
    const { data: body, error: parseError } = safeParseJson<ValidateTokenRequest>(bodyText);
    
    if (parseError || !body?.token) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format or missing token' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the database function to validate and use the token
    const { data, error } = await supabase.rpc('use_access_token', {
      token_value: token
    });

    if (error) {
      console.error('Error using access token:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to validate token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: data.error || 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Access token validated for user ${data.user_id}, type: ${data.token_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: data.user_id,
        token_type: data.token_type
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in validate-access-token function:', error);
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