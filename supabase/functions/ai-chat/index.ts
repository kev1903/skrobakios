import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const xaiApiKey = Deno.env.get('xAi'); // Use the correct secret name
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Utility function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to retry API calls
const withRetry = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    console.error(`Attempt failed:`, error);
    if (retries > 0 && (error.message?.includes('rate limit') || error.message?.includes('network'))) {
      console.log(`Retrying in ${RETRY_DELAY}ms... (${retries} attempts left)`);
      await sleep(RETRY_DELAY);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI Chat Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const apikey = req.headers.get('apikey');
    
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('API key:', apikey ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header');
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Please log in to use the AI chat'
      }), {
        status: 200, // Return 200 to avoid generic error handling
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token length:', jwt.length);
    
    // Create Supabase client with user's JWT for authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          authorization: authHeader,
          apikey: apikey || supabaseAnonKey
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create service role client for logging (bypasses RLS)
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication by getting user info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    console.log('User found:', user ? user.id : 'None');
    console.log('Auth error:', authError ? authError.message : 'None');
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      
      // Log authentication failure for debugging (without sensitive data)
      try {
        await supabaseServiceClient.from('ai_chat_logs').insert({
          user_id: null, // No user ID available
          message_type: 'auth_failure',
          context: { 
            error: authError?.message || 'No user found',
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Failed to log authentication failure:', logError);
      }
      
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Please log in to use the AI chat'
      }), {
        status: 401, // Use proper HTTP status for authentication errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request format',
        details: 'Request body must be valid JSON'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversation, context } = requestBody;

    // Validate input parameters
    if (!message || typeof message !== 'string') {
      console.error('Invalid message parameter:', message);
      return new Response(JSON.stringify({ 
        error: 'Invalid message',
        details: 'Message must be a non-empty string'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Message received:', message.substring(0, 100) + '...');
    console.log('Context:', JSON.stringify(context, null, 2));

    // Log interaction for audit purposes using service role client
    try {
      await supabaseServiceClient.from('ai_chat_logs').insert({
        user_id: user.id,
        message_type: 'user_query',
        context: context || {},
        created_at: new Date().toISOString()
      });
      console.log('User query logged successfully');
    } catch (logError) {
      console.error('Failed to log user query:', logError);
    }

    // Build context-aware system prompt
    let systemPrompt = `You are Grok, an AI assistant for the Skrobaki construction management platform. You have access to the user's business and project data through secure APIs.

CURRENT CONTEXT:
- User ID: ${user.id}
- Screen: ${context?.currentPage || 'Unknown'}
- Project ID: ${context?.projectId || 'None'}
- Visible Data: ${JSON.stringify(context?.visibleData || {})}

CAPABILITIES:
- View and analyze user's projects, tasks, schedules, and business data
- Make updates to projects and tasks (with user permission)
- Provide insights and recommendations based on current screen context
- Help with project management, scheduling, and construction processes

SECURITY RULES:
- Only access data belonging to the authenticated user
- Respect user permissions and company boundaries
- Never reveal data from other users or companies
- All database operations must use user's JWT for RLS enforcement

RESPONSE GUIDELINES:
- Be concise and actionable
- Reference current screen context when relevant
- Ask for confirmation before making significant changes
- Provide specific, construction-industry relevant advice`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(conversation || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Prepared messages for xAI API:', messages.length, 'messages');

    // Check if xAI API key is available
    if (!xaiApiKey) {
      console.error('xAI API key is not configured');
      return new Response(JSON.stringify({ 
        error: 'AI service is not configured',
        details: 'Please configure the xAI API key in the environment settings'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('xAI API key present, making API call...');

    // Make xAI API call with retry logic
    let aiResponse;
    try {
      const apiCall = async () => {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        console.log('xAI API response status:', response.status);
        console.log('xAI API response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('xAI API error response:', errorText);
          throw new Error(`xAI API error: ${response.status} - ${errorText}`);
        }

        return response;
      };

      const response = await withRetry(apiCall);
      const data = await response.json();
      
      console.log('xAI API response data keys:', Object.keys(data));
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid xAI API response structure:', data);
        throw new Error('Invalid response structure from xAI API');
      }

      aiResponse = data.choices[0].message.content;
      console.log('AI response received, length:', aiResponse.length);

    } catch (apiError) {
      console.error('xAI API call failed after retries:', apiError);
      
      // Return a user-friendly error message
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable',
        details: 'Please try again in a moment. If the issue persists, contact support.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log AI response for audit purposes using service role client
    try {
      await supabaseServiceClient.from('ai_chat_logs').insert({
        user_id: user.id,
        message_type: 'ai_response',
        response_length: aiResponse.length,
        created_at: new Date().toISOString()
      });
      console.log('AI response logged successfully');
    } catch (logError) {
      console.error('Failed to log AI response:', logError);
    }

    console.log('=== AI Chat Function Completed Successfully ===');
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== AI Chat Function Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable',
      details: 'An unexpected error occurred. Please try again or contact support if the issue persists.'
    }), {
      status: 200, // Return 200 to avoid generic error handling
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});