import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const xaiApiKey = Deno.env.get('xAi'); // Use the correct secret name
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

console.log('Environment check:', {
  hasXaiKey: !!xaiApiKey,
  hasSupabaseUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey
});

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

// Function to broadcast real-time updates
const broadcastUpdate = async (supabaseClient: any, table: string, operation: string, data: any) => {
  try {
    const channel = supabaseClient.channel(`ai_broadcast_${Date.now()}`);
    await channel.send({
      type: 'broadcast',
      event: 'ai_update',
      payload: {
        table,
        operation,
        data,
        timestamp: new Date().toISOString()
      }
    });
    console.log(`Broadcasted ${operation} for ${table}:`, data);
  } catch (error) {
    console.error('Failed to broadcast update:', error);
  }
};

// Function to execute AI commands
const executeAiCommand = async (commandData: any, supabaseClient: any, projectId: string) => {
  const { command, data } = commandData;
  
  try {
    switch (command) {
      case 'CREATE_TASK':
        // For sk_25008_design table (SK project)
        if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
          const taskData = {
            task_name: data.task_name,
            description: data.description,
            task_type: data.task_type || 'Design',
            status: data.status || 'pending',
            start_date: data.start_date,
            end_date: data.end_date,
            duration_days: data.duration_days || 1,
            progress_percentage: data.progress_percentage || 0
          };

          const { data: insertedData, error } = await supabaseClient
            .from('sk_25008_design')
            .insert(taskData)
            .select()
            .single();
          
          if (error) {
            console.error('Error creating SK task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the update
          await broadcastUpdate(supabaseClient, 'sk_25008_design', 'INSERT', insertedData);
          
          return { 
            success: true, 
            message: `Created new SK design task: "${data.task_name}"` 
          };
        } else {
          // For general tasks table
          const taskData = {
            task_name: data.task_name,
            description: data.description,
            status: data.status || 'pending',
            start_date: data.start_date,
            end_date: data.end_date,
            due_date: data.end_date || data.due_date,
            duration: data.duration_days,
            progress: data.progress_percentage || 0,
            priority: data.priority || 'medium',
            project_id: projectId
          };

          const { data: insertedData, error } = await supabaseClient
            .from('tasks')
            .insert(taskData)
            .select()
            .single();
          
          if (error) {
            console.error('Error creating general task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the update
          await broadcastUpdate(supabaseClient, 'tasks', 'INSERT', insertedData);
          
          return { 
            success: true, 
            message: `Created new task: "${data.task_name}"` 
          };
        }
        
      case 'UPDATE_TASK':
        const { id, updates } = data;
        
        // Determine which table to update based on project
        if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
          // Map updates to sk_25008_design format
          const skUpdates: any = {};
          if (updates.task_name) skUpdates.task_name = updates.task_name;
          if (updates.description) skUpdates.description = updates.description;
          if (updates.status) skUpdates.status = updates.status;
          if (updates.start_date) skUpdates.start_date = updates.start_date;
          if (updates.end_date) skUpdates.end_date = updates.end_date;
          if (updates.duration_days) skUpdates.duration_days = updates.duration_days;
          if (updates.progress_percentage !== undefined) skUpdates.progress_percentage = updates.progress_percentage;
          
          const { data: updatedData, error } = await supabaseClient
            .from('sk_25008_design')
            .update(skUpdates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating SK task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the update
          await broadcastUpdate(supabaseClient, 'sk_25008_design', 'UPDATE', updatedData);
          
          return { 
            success: true, 
            message: `Updated SK design task successfully` 
          };
        } else {
          // Update general tasks table
          const { data: updatedData, error } = await supabaseClient
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating general task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the update
          await broadcastUpdate(supabaseClient, 'tasks', 'UPDATE', updatedData);
          
          return { 
            success: true, 
            message: `Updated task successfully` 
          };
        }
        
      case 'DELETE_TASK':
        const taskId = data.id;
        
        // Determine which table to delete from
        if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
          // First get the task data before deletion
          const { data: taskToDelete } = await supabaseClient
            .from('sk_25008_design')
            .select('*')
            .eq('id', taskId)
            .single();

          const { error } = await supabaseClient
            .from('sk_25008_design')
            .delete()
            .eq('id', taskId);
          
          if (error) {
            console.error('Error deleting SK task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the deletion
          if (taskToDelete) {
            await broadcastUpdate(supabaseClient, 'sk_25008_design', 'DELETE', { id: taskId, old: taskToDelete });
          }
          
          return { 
            success: true, 
            message: `Deleted SK design task successfully` 
          };
        } else {
          // First get the task data before deletion
          const { data: taskToDelete } = await supabaseClient
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();

          const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', taskId);
          
          if (error) {
            console.error('Error deleting general task:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast the deletion
          if (taskToDelete) {
            await broadcastUpdate(supabaseClient, 'tasks', 'DELETE', { id: taskId, old: taskToDelete });
          }
          
          return { 
            success: true, 
            message: `Deleted task successfully` 
          };
        }
        break;
        
      case 'DELETE_ALL_TASKS':
        // Determine which table to delete from based on project
        if (projectId === '736d0991-6261-4884-8353-3522a7a98720' || projectId?.toLowerCase().includes('sk')) {
          // First get all tasks before deletion for broadcasting
          const { data: tasksToDelete } = await supabaseClient
            .from('sk_25008_design')
            .select('*')
            .eq('company_id', '4042458b-8e95-4842-90d9-29f43815ecf8'); // Filter by company

          const { error } = await supabaseClient
            .from('sk_25008_design')
            .delete()
            .eq('company_id', '4042458b-8e95-4842-90d9-29f43815ecf8'); // Filter by company for deletion
          
          if (error) {
            console.error('Error deleting all SK tasks:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast deletions for each task
          if (tasksToDelete && tasksToDelete.length > 0) {
            for (const task of tasksToDelete) {
              await broadcastUpdate(supabaseClient, 'sk_25008_design', 'DELETE', { id: task.id, old: task });
            }
          }
          
          return {
            success: true, 
            message: `Deleted all ${tasksToDelete?.length || 0} tasks from project` 
          };
        } else {
          // First get all tasks before deletion for broadcasting
          const { data: tasksToDelete } = await supabaseClient
            .from('tasks')
            .select('*')
            .eq('project_id', projectId);

          const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('project_id', projectId);
          
          if (error) {
            console.error('Error deleting all general tasks:', error);
            return { success: false, error: error.message };
          }
          
          // Broadcast deletions for each task
          if (tasksToDelete && tasksToDelete.length > 0) {
            for (const task of tasksToDelete) {
              await broadcastUpdate(supabaseClient, 'tasks', 'DELETE', { id: task.id, old: task });
            }
          }
          
          return { 
            success: true, 
            message: `Deleted all ${tasksToDelete?.length || 0} tasks from project` 
          };
        }
        break;
        
      default:
        return { 
          success: false, 
          error: `Unknown command: ${command}` 
        };
    }
  } catch (error) {
    console.error('Command execution error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
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

    // Check if xAI API key is configured
    if (!xaiApiKey) {
      console.error('xAI API key is not configured');
      return new Response(JSON.stringify({ 
        error: 'AI service is not configured',
        details: 'The AI service is temporarily unavailable. Please contact support.'
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
    let userTasks = [];
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
      
      // Get tasks for the current project or all user projects
      const currentProjectId = context?.projectId;
      if (currentProjectId) {
        // Try to fetch from sk_25008_design table first for the current project
        if (currentProjectId === '736d0991-6261-4884-8353-3522a7a98720' || currentProjectId?.toLowerCase().includes('sk')) {
          const { data: sk25008Tasks, error: sk25008Error } = await supabaseClient
            .from('sk_25008_design')
            .select('*')
            .order('start_date', { ascending: true });

          if (!sk25008Error && sk25008Tasks && sk25008Tasks.length > 0) {
            userTasks = sk25008Tasks.map((task: any) => ({
              id: task.id,
              task_name: task.task_name,
              task_type: task.task_type,
              status: task.status,
              start_date: task.start_date,
              end_date: task.end_date,
              due_date: task.end_date,
              duration: task.duration_days,
              progress: task.progress_percentage,
              progress_percentage: task.progress_percentage,
              description: task.description,
              priority: 'medium',
              assigned_to_name: 'Project Team',
              project_id: currentProjectId,
              requirements: task.requirements,
              compliance_notes: task.compliance_notes,
              table_source: 'sk_25008_design'
            }));
          }
        }
        
        // If no sk_25008_design tasks found, try general tasks table
        if (userTasks.length === 0) {
          const { data: generalTasks, error: generalError } = await supabaseClient
            .from('tasks')
            .select('*')
            .eq('project_id', currentProjectId)
            .order('due_date', { ascending: true });

          if (!generalError && generalTasks) {
            userTasks = generalTasks.map((task: any) => ({
              ...task,
              table_source: 'tasks'
            }));
          }
        }
      } else if (userProjects.length > 0) {
        // Get tasks for all user projects
        const projectIds = userProjects.map(p => p.id);
        const { data: allTasks, error: tasksError } = await supabaseClient
          .from('tasks')
          .select('*')
          .in('project_id', projectIds)
          .order('due_date', { ascending: true });
        
        if (!tasksError && allTasks) {
          userTasks = allTasks.map((task: any) => ({
            ...task,
            table_source: 'tasks'
          }));
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

USER'S TASKS (for current project ${context?.projectId || 'all projects'}):
${userTasks.length > 0 ? userTasks.map(t => {
  const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set';
  return `- **${t.task_name}** - Status: ${t.status}, Progress: ${t.progress || t.progress_percentage || 0}%
    Type: ${t.task_type || 'General'}, Duration: ${t.duration || 'N/A'} days
    Start: ${formatDate(t.start_date)}, End: ${formatDate(t.end_date || t.due_date)}
    ${t.description ? `Description: ${t.description}` : ''}
    ${t.requirements ? `Requirements: ${t.requirements}` : ''}
    ${t.compliance_notes ? `Compliance: ${t.compliance_notes}` : ''}
    Assigned to: ${t.assigned_to_name || 'Unassigned'}
    Source: ${t.table_source}`;
}).join('\n') : 'No tasks found'}

CURRENT CONTEXT:
- User ID: ${user.id}
- Screen: ${context?.currentPage || 'Unknown'}
- Project ID: ${context?.projectId || 'None'}
- Visible Data: ${JSON.stringify(context?.visibleData || {})}

IMPORTANT SECURITY RULES:
- ONLY discuss and reference the projects and tasks listed above that belong to this user
- NEVER mention or reference projects or tasks from other companies or users
- All project data must be filtered to only include projects from companies where this user is a member
- If asked about projects or tasks not in the lists above, respond that no such items exist for this user

CAPABILITIES:
- View and analyze user's projects, tasks, schedules, and business data
- Make updates to projects and tasks (with user permission)
- Provide insights and recommendations based on current screen context
- Help with project management, scheduling, and construction processes

DATABASE COMMANDS:
When the user requests database changes (create, update, delete tasks), you MUST include an EXECUTE_COMMAND in your response:

For deleting ALL tasks in project:
EXECUTE_COMMAND: {"command": "DELETE_ALL_TASKS", "data": {}}

For updating a task:
EXECUTE_COMMAND: {"command": "UPDATE_TASK", "data": {"id": "task-id", "task_name": "name", "progress_percentage": 50, "status": "pending"}}

For creating a task:
EXECUTE_COMMAND: {"command": "CREATE_TASK", "data": {"task_name": "New Task", "task_type": "design", "duration_days": 5, "status": "pending"}}

For deleting a single task:
EXECUTE_COMMAND: {"command": "DELETE_TASK", "data": {"id": "task-id"}}

RESPONSE GUIDELINES:
- Be concise and actionable
- Reference current screen context when relevant
- Use the EXACT task data shown above - do not make up or hallucinate tasks
- When listing tasks, only mention the tasks from the USER'S TASKS section above
- Ask for confirmation before making significant changes, then include the EXECUTE_COMMAND if confirmed
- Provide specific, construction-industry relevant advice
- Only reference the projects, companies, and tasks listed in the sections above
- ALWAYS include EXECUTE_COMMAND when performing database operations`;

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

      // Process AI commands if present in the response - improved JSON parsing
      const commandMatch = aiResponse.match(/EXECUTE_COMMAND:\s*({[\s\S]*?})/);
      if (commandMatch) {
        try {
          console.log('Raw command match:', commandMatch[1]);
          
          // Clean up the JSON string
          let jsonString = commandMatch[1].trim();
          
          // Remove any trailing text after the JSON object
          let braceCount = 0;
          let endIndex = 0;
          for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') braceCount++;
            if (jsonString[i] === '}') braceCount--;
            if (braceCount === 0) {
              endIndex = i + 1;
              break;
            }
          }
          
          if (endIndex > 0) {
            jsonString = jsonString.substring(0, endIndex);
          }
          
          console.log('Cleaned JSON string:', jsonString);
          const commandData = JSON.parse(jsonString);
          console.log('AI command detected:', commandData);
          
          // Execute the command
          const commandResult = await executeAiCommand(commandData, supabaseClient, context?.projectId);
          
          if (commandResult.success) {
            console.log('AI command executed successfully:', commandResult);
            // Append execution result to AI response
            aiResponse += `\n\n✅ **Command executed successfully:** ${commandResult.message}`;
          } else {
            console.error('AI command failed:', commandResult.error);
            aiResponse += `\n\n❌ **Command failed:** ${commandResult.error}`;
          }
        } catch (cmdError) {
          console.error('Error processing AI command:', cmdError);
          console.error('Command error details:', {
            message: cmdError.message,
            stack: cmdError.stack,
            name: cmdError.name
          });
          aiResponse += `\n\n❌ **Command processing error:** ${cmdError.message || 'Unable to execute the requested action.'}`;
        }
      }

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