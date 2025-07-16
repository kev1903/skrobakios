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
    console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header - Header:', authHeader);
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Please log in to use the AI chat'
      }), {
        status: 401, // Return proper 401 status
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

    // Create a service role client for authentication verification
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verify user authentication by checking the JWT token directly
    let user;
    try {
      const { data: { user: authenticatedUser }, error: authError } = await serviceClient.auth.getUser(jwt);
      
      console.log('User found:', authenticatedUser ? authenticatedUser.id : 'None');
      console.log('Auth error:', authError ? authError.message : 'None');
      
      if (authError || !authenticatedUser) {
        console.error('Authentication failed:', authError);
        
        return new Response(JSON.stringify({ 
          error: 'Authentication required',
          details: 'Please log in to use the AI chat'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      user = authenticatedUser;
    } catch (jwtError) {
      console.error('Failed to verify JWT token:', jwtError);
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Invalid authentication token'
      }), {
        status: 401,
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
    console.log('User ID:', user.id);

    // Fetch user's company and project data
    let userCompanies = [];
    let userProjects = [];
    let userProfile = null;
    
    try {
      // Get user's companies
      const { data: companies, error: companiesError } = await supabaseClient
        .from('companies')
        .select(`
          id, name, slug,
          company_members!inner(role, status)
        `)
        .eq('company_members.user_id', user.id)
        .eq('company_members.status', 'active');
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
      } else {
        userCompanies = companies || [];
      }
      
      // Get user's projects from their companies
      if (userCompanies.length > 0) {
        const companyIds = userCompanies.map(c => c.id);
        const { data: projects, error: projectsError } = await supabaseClient
          .from('projects')
          .select('id, name, project_id, description, status, priority, location, company_id')
          .in('company_id', companyIds);
        
        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else {
          userProjects = projects || [];
        }
      }
      
      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, email, company, job_title')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        userProfile = profile;
      }
      
    } catch (dbError) {
      console.error('Database query error:', dbError);
    }

    // Build context-aware system prompt with actual user data
    let systemPrompt = `You are SkAi, an AI assistant for ${userProfile?.first_name || 'the user'} on SkrobakiOS. You have access to their business and project data.

USER PROFILE:
- Name: ${userProfile?.first_name} ${userProfile?.last_name}
- Email: ${userProfile?.email}
- Company: ${userProfile?.company}
- Job Title: ${userProfile?.job_title}

USER'S COMPANIES:
${userCompanies.map(c => `- ${c.name} (Role: ${c.company_members[0]?.role})`).join('\n')}

USER'S PROJECTS:
${userProjects.length > 0 ? userProjects.map(p => `- ${p.name} (${p.company_id}) - Status: ${p.status}, Priority: ${p.priority || 'Not set'}`).join('\n') : 'No projects found'}

CURRENT CONTEXT:
- User ID: ${user.id}
- Screen: ${context?.currentPage || 'Unknown'}
- Project ID: ${context?.projectId || 'None'}
- Visible Data: ${JSON.stringify(context?.visibleData || {})}

IMPORTANT SECURITY RULES:
- ONLY discuss and reference the projects listed above that belong to this user
- NEVER mention or reference projects from other companies or users
- All project data must be filtered to only include projects from companies where this user is a member
- If asked about projects not in the list above, respond that no such projects exist for this user

CAPABILITIES:
- View and analyze user's projects, tasks, schedules, and business data
- Make updates to projects and tasks (with user permission)
- Provide insights and recommendations based on current screen context
- Help with project management, scheduling, and construction processes

RESPONSE GUIDELINES:
- Be concise and actionable
- Reference current screen context when relevant
- Ask for confirmation before making significant changes
- Provide specific, construction-industry relevant advice
- Only reference the projects and companies listed in the USER'S PROJECTS section above`;

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
        status: 500, // Use proper error status
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
            model: 'grok-2-1212',
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
      console.error('Error details:', {
        message: apiError.message,
        stack: apiError.stack,
        name: apiError.name
      });
      
      // Return a more specific error message based on the error type
      let errorMessage = 'AI service temporarily unavailable';
      let errorDetails = 'Please try again in a moment. If the issue persists, contact support.';
      
      if (apiError.message?.includes('401')) {
        errorMessage = 'AI service authentication failed';
        errorDetails = 'The AI API key may be invalid or expired. Please contact support.';
      } else if (apiError.message?.includes('429')) {
        errorMessage = 'AI service rate limited';
        errorDetails = 'Too many requests. Please wait a moment and try again.';
      } else if (apiError.message?.includes('network') || apiError.message?.includes('fetch')) {
        errorMessage = 'AI service connection failed';
        errorDetails = 'Unable to connect to the AI service. Please check your internet connection and try again.';
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Note: Removed audit logging to avoid RLS constraint issues
    // AI response logged in console for debugging

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