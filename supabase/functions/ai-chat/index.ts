import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get project data
async function getProjectData(supabase: any, userId: string, projectId?: string) {
  try {
    // Get user's active company
    const { data: companyMembers } = await supabase
      .from('company_members')
      .select('company_id, companies(name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);

    if (!companyMembers?.length) {
      return { projects: [], tasks: [], costs: [], leads: [], wbsItems: [] };
    }

    const companyId = companyMembers[0].company_id;
    const companyName = companyMembers[0].companies?.name;

    // Get projects
    let projectsQuery = supabase
      .from('projects')
      .select('id, project_id, name, description, status, priority, location, start_date, deadline, contract_price')
      .eq('company_id', companyId);

    if (projectId) {
      projectsQuery = projectsQuery.eq('id', projectId);
    }

    const { data: projects } = await projectsQuery;

    // Get WBS items for the project (this is the main project scope data)
    let wbsItems = [];
    if (projectId) {
      const { data: wbsData } = await supabase
        .from('wbs_items')
        .select('id, wbs_id, title, description, status, progress, level, category, priority, assigned_to, start_date, end_date, duration, budgeted_cost, actual_cost, health, progress_status, at_risk')
        .eq('project_id', projectId)
        .order('level', { ascending: true })
        .order('wbs_id', { ascending: true });
      
      wbsItems = wbsData || [];
    }

    // Get tasks for projects
    const projectIds = projects?.map(p => p.id) || [];
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, task_name, description, status, priority, progress, due_date, project_id, assigned_to_name')
      .in('project_id', projectIds);

    // Get project costs
    const { data: costs } = await supabase
      .from('project_costs')
      .select('id, cost_category, budget_amount, actual_amount, allocated_amount, project_id, description')
      .eq('company_id', companyId);

    // Get leads
    const { data: leads } = await supabase
      .from('leads')
      .select('id, company, contact_name, stage, priority, value, location, description')
      .eq('company_id', companyId);

    return {
      company: { name: companyName },
      projects: projects || [],
      wbsItems: wbsItems || [],
      tasks: tasks || [],
      costs: costs || [],
      leads: leads || []
    };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return { projects: [], tasks: [], costs: [], leads: [], wbsItems: [] };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create Supabase client with service role key for data access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { message, conversation = [], context = {}, imageData } = await req.json();

    if (!message && !imageData) {
      throw new Error('Message or image data is required');
    }

    console.log('Processing AI chat request for user:', user.email);

    // Get project data based on context
    const projectData = await getProjectData(supabase, user.id, context.projectId);

    // Build enhanced system prompt with project context
    const systemPrompt = `You are SkAi, an intelligent construction management assistant for Skrobaki. 

CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in English language. Never use Korean, Chinese, Japanese, or any other language. All responses must be in clear, professional English.

CRITICAL RESPONSE STYLE: Keep responses CONCISE, STRUCTURED, and FOCUSED. Users lose interest with too much detail. Prioritize key insights over comprehensive lists.

NEW CAPABILITY: DATABASE OPERATIONS
You now have the ability to directly modify project data when requested. When users ask you to update, add, or modify project information, you can:
1. Analyze their request
2. Determine what database changes are needed
3. Execute those changes directly
4. Confirm the changes were made

REQUIRED FORMAT - Use this structure ALWAYS:

**🎯 [MAIN TOPIC]**
Brief summary (1-2 sentences max)

**📊 Key Facts:**
• Most important point only
• Critical status/progress if relevant
• Priority issue (if any)

**💡 Insight:**
One key insight or recommendation

**⚡ Next Action:**
Single, specific next step (when relevant)

**🔧 Database Operations:**
When performing data changes, explain what was modified

COMPANY: ${projectData.company?.name || 'Unknown'}
CURRENT PROJECT: ${projectData.projects?.[0]?.name || 'Unknown Project'}

AVAILABLE DATA:
- ${projectData.projects?.length || 0} projects, ${projectData.wbsItems?.length || 0} WBS items, ${projectData.tasks?.length || 0} tasks, ${projectData.costs?.length || 0} cost items

PROJECT SCOPE (TOP WBS ITEMS):
${projectData.wbsItems?.slice(0, 5).map(item => 
  `${item.wbs_id} - ${item.title} (${item.status}, ${item.progress}%)`
).join('\n') || 'No WBS items available'}

CAPABILITIES:
- Quick project status analysis
- Focused insights on progress and issues
- Concise recommendations
- Brief summaries of project data
- DIRECT DATABASE MODIFICATIONS (NEW!)
- Add/update WBS items, tasks, costs
- Modify project scope and details
- Update progress and status information

RULES:
1. NEVER list everything - focus on what matters most
2. Keep total response under 150 words typically
3. Use bullet points sparingly (max 3-4 points)
4. Prioritize actionable insights over data dumps
5. If asked for details, still keep responses focused and structured
6. Use emojis in headers for visual appeal
7. Reference specific WBS items only when directly relevant
8. When making database changes, use the skai-database-operations function

DATABASE MODIFICATION INSTRUCTIONS:
When users request changes to project data (add WBS items, update tasks, modify costs, etc.), you should:
1. Call the skai-database-operations function with their request
2. Wait for the operation to complete
3. Confirm what was changed in your response
4. Keep the confirmation concise and focused

Be helpful, professional, and CONCISE. Focus on key insights that drive action and now execute database changes when requested.

LANGUAGE ENFORCEMENT: Respond exclusively in English. If any input contains non-English text, acknowledge it but respond in English only.`;

    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add user message with optional image
    const userMessage: any = { role: 'user' };
    
    if (imageData) {
      // Handle image with text
      userMessage.content = [
        {
          type: 'text',
          text: message || 'Please analyze this image in the context of construction management.'
        },
        {
          type: 'image_url',
          image_url: {
            url: imageData,
            detail: 'high'
          }
        }
      ];
    } else {
      // Text only
      userMessage.content = message;
    }
    
    messages.push(userMessage);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: null
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, response.statusText, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    let data;
    const responseText = await response.text();
    console.log('Raw OpenAI response:', responseText.substring(0, 200));
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse OpenAI response as JSON');
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }
    
    const generatedResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');
    console.log('Response preview:', generatedResponse?.substring(0, 100));
    
    // Check if response contains non-English characters and log warning
    const hasNonEnglish = /[^\x00-\x7F]/.test(generatedResponse);
    if (hasNonEnglish) {
      console.warn('WARNING: AI response contains non-English characters!');
      console.warn('Response language detected as potentially non-English');
    }

    // Log interaction for analytics
    await supabase
      .from('ai_chat_interactions')
      .insert({
        user_id: user.id,
        company_id: projectData.company ? null : null,
        project_id: context.projectId || null,
        command_text: message,
        response_summary: generatedResponse.substring(0, 200),
        context_data: context,
        success: true,
        execution_time_ms: Date.now()
      });

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      message: generatedResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    
    // Log failed interaction
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader && supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase
            .from('ai_chat_interactions')
            .insert({
              user_id: user.id,
              command_text: 'Error occurred',
              error_message: error.message,
              success: false,
              execution_time_ms: Date.now()
            });
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process AI chat request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});