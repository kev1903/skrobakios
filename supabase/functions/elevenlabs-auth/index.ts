import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting constants
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

// Initialize Supabase client for security logging
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting store (in-memory for edge function)
const rateLimitStore = new Map();

async function checkRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now();
  const key = `elevenlabs_auth:${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const limit = rateLimitStore.get(key);
  
  if (now > limit.resetTime) {
    // Reset the limit window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

async function logSecurityEvent(eventType: string, userId: string | null, metadata: any) {
  try {
    await supabase.from('security_events').insert({
      event_type: eventType,
      user_id: userId,
      metadata: metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract user identifier for rate limiting
    const authHeader = req.headers.get('authorization');
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const clientInfo = req.headers.get('x-client-info') || 'unknown';
    
    // Get user ID if authenticated
    let userId = null;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (error) {
        console.warn('Failed to get user from token:', error);
      }
    }
    
    // Use IP address as fallback identifier for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const identifier = userId || clientIP;
    
    // Check rate limits
    const withinRateLimit = await checkRateLimit(identifier);
    if (!withinRateLimit) {
      await logSecurityEvent('rate_limit_exceeded', userId, {
        service: 'elevenlabs-auth',
        identifier: identifier,
        user_agent: userAgent,
        client_info: clientInfo
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Your ElevenLabs agent ID
    const AGENT_ID = "ds9lm1cEPy0f80uZAvFu";

    console.log('Requesting signed URL for ElevenLabs agent...');

    // Get signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${AGENT_ID}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('ElevenLabs signed URL obtained successfully');

    // Log successful authentication
    await logSecurityEvent('elevenlabs_auth_success', userId, {
      service: 'elevenlabs-auth',
      agent_id: AGENT_ID,
      user_agent: userAgent,
      client_info: clientInfo
    });

    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url,
        agentId: AGENT_ID 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in elevenlabs-auth function:', error);
    
    // Log security event for errors
    await logSecurityEvent('elevenlabs_auth_error', userId, {
      service: 'elevenlabs-auth',
      error: error.message,
      user_agent: userAgent,
      client_info: clientInfo
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to authenticate with ElevenLabs'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});