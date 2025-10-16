import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get user's active company
async function getUserActiveCompany(supabase: any, userId: string) {
  const { data: companyMembers } = await supabase
    .from('company_members')
    .select('company_id, companies(name)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1);

  if (!companyMembers?.length) {
    return null;
  }

  return {
    id: companyMembers[0].company_id,
    name: companyMembers[0].companies?.name
  };
}

// Helper function to get document data
async function getDocumentData(supabase: any, documentId?: string) {
  if (!documentId) {
    return null;
  }

  try {
    const { data: document } = await supabase
      .from('project_documents')
      .select('id, document_name, ai_summary, metadata, analysis_status, file_size, created_at')
      .eq('id', documentId)
      .maybeSingle();

    return document;
  } catch (error) {
    console.error('Error fetching document data:', error);
    return null;
  }
}

// Helper function to get project data
async function getProjectData(supabase: any, userId: string, projectId?: string) {
  try {
    const company = await getUserActiveCompany(supabase, userId);
    if (!company) {
      return { projects: [], tasks: [], costs: [], leads: [], wbsItems: [] };
    }

    const companyId = company.id;
    const companyName = company.name;

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
    const projectIds = projects?.map((p: any) => p.id) || [];
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
    if (!lovableApiKey || !supabaseUrl || !supabaseServiceKey) {
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

    // Get user profile for first name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const userName = profile?.first_name || user.email?.split('@')[0] || 'there';

    // Parse request body with better error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Request body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { message, conversation = [], context = {}, imageData, documentContent, conversationId, companyId: requestCompanyId } = requestBody;

    if (!message && !imageData && !documentContent) {
      throw new Error('Message, image data, or document content is required');
    }

    console.log('Processing AI chat request for user:', user.email);
    console.log('Project context:', context);

    // Get user's active company for data isolation
    const company = await getUserActiveCompany(supabase, user.id);
    if (!company) {
      return new Response(
        JSON.stringify({ error: 'No active company found. Please select a company first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure the request is for the user's active company
    const activeCompanyId = requestCompanyId || company.id;
    if (activeCompanyId !== company.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this company data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate and ensure we have proper project context
    const validProjectId = context.projectId || context.project_id;
    if (!validProjectId) {
      console.warn('No project ID provided in context');
    }

    // Get document data if documentId is provided
    const validDocumentId = context.documentId;
    const documentData = await getDocumentData(supabase, validDocumentId);
    
    if (documentData) {
      console.log('Document found:', documentData.document_name);
      console.log('Document analysis status:', documentData.analysis_status);
      console.log('Document has AI summary:', !!documentData.ai_summary);
      console.log('Document has metadata:', !!documentData.metadata);
    }

    // Get project data based on context
    const projectData = await getProjectData(supabase, user.id, validProjectId);

    // Find the current project from the data
    const currentProject = validProjectId 
      ? projectData.projects?.find((p: any) => p.id === validProjectId) 
      : projectData.projects?.[0];
    
    console.log('Current project found:', currentProject?.name || 'None');
    console.log('Total projects available:', projectData.projects?.length || 0);
    console.log('WBS items for project:', projectData.wbsItems?.length || 0);

    // Build document context if available
    let documentContext = '';
    if (documentData) {
      documentContext = `
CURRENT DOCUMENT: ${documentData.document_name}
DOCUMENT ANALYSIS STATUS: ${documentData.analysis_status}

${documentData.ai_summary ? `DOCUMENT AI SUMMARY:
${documentData.ai_summary}
` : ''}

${documentData.metadata ? `EXTRACTED DOCUMENT DATA:
${JSON.stringify(documentData.metadata, null, 2)}
` : ''}

IMPORTANT: You have FULL ACCESS to this document's analyzed content above. You can see and analyze all the extracted data, scope items, spaces, materials, and specifications from the document.
`;
    }

    // Determine the context based on currentPage
    const currentPage = context.currentPage || context.pageContext;
    const isFinancePage = currentPage === 'finance' || currentPage === 'financial_analysis';
    
    // Build enhanced system prompt with context-appropriate content
    const systemPrompt = isFinancePage 
      ? `You are SkAI, a financial assistant for construction management. 

USER: ${userName}
IMPORTANT: When greeting or addressing the user, always use "${userName}" and never use their email address.

RESPONSE STYLE: Be conversational, natural, and concise. Focus on financial topics, budgets, costs, invoices, and cash flow. Respond like a knowledgeable financial advisor would - direct, helpful, and to the point.

COMPANY: ${projectData.company?.name || 'Unknown'}
CURRENT PAGE: Finance Overview

AVAILABLE FINANCIAL DATA:
- ${projectData.projects?.length || 0} active projects
- ${projectData.costs?.length || 0} cost items tracked
- Financial metrics and trends across all projects

FOCUS AREAS:
- Budget analysis and tracking
- Cost management and allocation
- Invoice and billing insights
- Cash flow recommendations
- Financial reporting and metrics
- Project financial health
- Budget vs. actual analysis

CAPABILITIES:
- Analyze financial performance across projects
- Provide budget recommendations and insights
- Track costs and spending patterns
- Answer questions about invoices, bills, and payments
- Help with financial planning and forecasting
- Identify cost-saving opportunities
- Review financial health of projects`
      : `You are SkAI, a professional construction management assistant for Skrobaki. 

USER: ${userName}
IMPORTANT: When greeting or addressing the user, always use "${userName}" and never use their email address.

RESPONSE STYLE: Be conversational, natural, and concise. Respond like a knowledgeable colleague would - direct, helpful, and to the point. Avoid unnecessary formatting, emojis, or bullet points unless specifically requested.

COMPANY: ${projectData.company?.name || 'Unknown'}
CURRENT PROJECT: ${currentProject?.name || 'No specific project selected'}
PROJECT ID: ${validProjectId || 'Not specified'}

IMPORTANT: You are currently working within the context of "${currentProject?.name || 'this project'}" ONLY. Do not reference or mention other projects unless specifically asked to compare projects.

AVAILABLE DATA FOR THIS PROJECT:
- ${projectData.wbsItems?.length || 0} WBS items, ${projectData.tasks?.length || 0} tasks, ${projectData.costs?.length || 0} cost items

PROJECT SCOPE (TOP WBS ITEMS):
${projectData.wbsItems?.slice(0, 5).map((item: any) => 
  `${item.wbs_id} - ${item.title} (${item.status}, ${item.progress}%)`
).join('\n') || 'No WBS items available for this project'}

${documentContext}

CAPABILITIES:
- Answer questions about project status, progress, costs, and tasks
- Provide insights and recommendations based on project data
- Help with project management decisions
- Execute database changes when requested (add/update/remove items)
- Analyze uploaded documents, PDFs, and drawings for construction insights
- Extract scope of work from architectural plans and technical documents
- Review drawings for construction requirements and specifications

DOCUMENT ANALYSIS CAPABILITIES:
When analyzing uploaded documents (PDFs, drawings, plans):
- You have FULL ACCESS to the analyzed document content shown above
- Extract scope of work items from construction documents
- Identify key specifications, materials, and requirements
- Break down complex plans into manageable work packages
- Suggest WBS items based on document content
- Analyze drawings for potential risks or considerations
- Answer detailed questions about the document using the extracted data

RESPONSE GUIDELINES:
1. Keep responses brief and focused (typically 2-3 sentences)
2. Only provide the most relevant information
3. Use natural language without excessive formatting
4. When making database changes, simply confirm what was done
5. Be professional but approachable
6. When asked about documents, use the EXTRACTED DOCUMENT DATA provided above

When users request data modifications, use the available database operations to make changes and confirm completion naturally.`;

    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add user message with optional image or document content
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
    } else if (documentContent) {
      // Handle document content analysis
      userMessage.content = message || 'Please analyze this document content in the context of construction management.';
    } else {
      // Text only
      userMessage.content = message;
    }
    
    messages.push(userMessage);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', response.status, response.statusText, errorData);
      throw new Error(`Lovable AI API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    let data;
    const responseText = await response.text();
    console.log('Raw Lovable AI response:', responseText.substring(0, 200));
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Lovable AI response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse Lovable AI response as JSON');
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Lovable AI response structure:', data);
      throw new Error('Invalid response structure from Lovable AI');
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

    // Store the assistant response in database for company-level isolation
    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          company_id: activeCompanyId,
          conversation_id: conversationId,
          content: generatedResponse,
          role: 'assistant',
          context: context || {},
          image_data: null,
          attachments: []
        });
    } catch (error) {
      console.error('Error storing assistant message:', error);
      // Continue even if storage fails
    }

    // Log interaction for analytics
    await supabase
      .from('ai_chat_interactions')
      .insert({
        user_id: user.id,
        company_id: activeCompanyId,
        project_id: validProjectId || null,
        command_text: message,
        response_summary: generatedResponse.substring(0, 200),
        context_data: context,
        success: true,
        execution_time_ms: Date.now()
      });

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      message: generatedResponse,
      conversationId: conversationId
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
              error_message: (error as Error).message,
              success: false,
              execution_time_ms: Date.now()
            });
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      details: 'Failed to process AI chat request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});