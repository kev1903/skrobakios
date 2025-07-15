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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    const apikey = req.headers.get('apikey');
    
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('API key:', apikey ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
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
      }
    });

    // Create service role client for logging (bypasses RLS)
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication by getting user info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    console.log('User found:', user ? user.id : 'None');
    console.log('Auth error:', authError ? authError.message : 'None');
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversation, context } = await req.json();

    // Log interaction for audit purposes using service role client
    await supabaseServiceClient.from('ai_chat_logs').insert({
      user_id: user.id,
      message_type: 'user_query',
      context: context || {},
      created_at: new Date().toISOString()
    }).catch(err => console.log('Log insert failed:', err));

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
      ...conversation,
      { role: 'user', content: message }
    ];

    // Check if xAI API key is available
    if (!xaiApiKey) {
      console.error('xAI API key is not configured');
      return new Response(JSON.stringify({ error: 'AI service is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log AI response for audit purposes using service role client
    await supabaseServiceClient.from('ai_chat_logs').insert({
      user_id: user.id,
      message_type: 'ai_response',
      response_length: aiResponse.length,
      created_at: new Date().toISOString()
    }).catch(err => console.log('Log insert failed:', err));

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});