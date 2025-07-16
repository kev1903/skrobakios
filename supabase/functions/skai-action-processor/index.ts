import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionRequest {
  prompt: string;
  context: {
    projectId: string;
    currentPage: string;
    userId: string;
    companyId: string;
  };
}

interface ParsedAction {
  type: string;
  entity: string;
  operation: string;
  parameters: Record<string, any>;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user session
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { prompt, context }: ActionRequest = await req.json();

    console.log('Skai Action Processor - Processing prompt:', prompt);
    console.log('Context:', context);

    // Validate user has access to the project/company
    const { data: membership, error: membershipError } = await supabaseClient
      .from('company_members')
      .select('role, status')
      .eq('user_id', user.id)
      .eq('company_id', context.companyId)
      .eq('status', 'active')
      .single();

    if (membershipError || !membership) {
      throw new Error('Access denied to company resources');
    }

    // Parse the natural language command using xAI
    const parsedActions = await parseNaturalLanguageCommand(prompt, context);
    
    const results = [];
    
    // Execute each parsed action
    for (const action of parsedActions) {
      try {
        const result = await executeAction(action, context, supabaseClient, user.id, membership.role);
        results.push({
          action: action.type,
          entity: action.entity,
          success: true,
          result: result,
          message: `Successfully ${action.operation} ${action.entity}`
        });
        
        // Log successful action
        await logAction(supabaseClient, {
          user_id: user.id,
          company_id: context.companyId,
          project_id: context.projectId,
          action_type: action.type,
          action_description: `${action.operation} ${action.entity}`,
          command_data: { prompt, action, context },
          success: true,
          execution_result: result
        });
        
      } catch (actionError) {
        console.error(`Error executing action:`, actionError);
        results.push({
          action: action.type,
          entity: action.entity,
          success: false,
          error: actionError.message,
          message: `Failed to ${action.operation} ${action.entity}: ${actionError.message}`
        });
        
        // Log failed action
        await logAction(supabaseClient, {
          user_id: user.id,
          company_id: context.companyId,
          project_id: context.projectId,
          action_type: action.type,
          action_description: `${action.operation} ${action.entity}`,
          command_data: { prompt, action, context },
          success: false,
          error_message: actionError.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: generateActionSummary(results)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Skai Action Processor Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      suggestion: "Please clarify your request or check your permissions."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function parseNaturalLanguageCommand(prompt: string, context: any): Promise<ParsedAction[]> {
  const xaiApiKey = Deno.env.get('xAi');
  
  if (!xaiApiKey) {
    throw new Error('xAI API key not configured');
  }

  const systemPrompt = `You are Skai, an AI assistant for construction project management. Parse the user's natural language command and extract actionable tasks.

Available actions:
- TASK: create, update, delete, assign, reschedule tasks
- ISSUE: create, update, resolve, assign issues  
- TEAM: assign team members, update roles
- SCOPE: adjust project scope, add/remove deliverables
- COST: track costs, update budgets, create estimates
- SCHEDULE: optimize schedules, adjust timelines, manage dependencies
- QUALITY: create quality checks, update compliance status
- PROCUREMENT: manage procurement, update supplier status

Context: User is on ${context.currentPage} for project ${context.projectId}

Return a JSON array of actions with this structure:
{
  "type": "ACTION_TYPE",
  "entity": "specific_item_name", 
  "operation": "create|update|delete|assign|etc",
  "parameters": {
    "field": "value",
    "date": "YYYY-MM-DD",
    "assignee": "user_name",
    "priority": "high|medium|low"
  },
  "confidence": 0.95
}

Examples:
- "Create a task for foundation inspection" → type: "TASK", operation: "create", entity: "foundation inspection"
- "Reschedule Detailed Design to Jul 22" → type: "TASK", operation: "reschedule", entity: "Detailed Design", parameters: {"due_date": "2025-07-22"}
- "Assign quality check to John" → type: "QUALITY", operation: "assign", entity: "quality check", parameters: {"assignee": "John"}

Only return valid JSON array, no other text.`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const parsedContent = data.choices[0].message.content;
  
  try {
    return JSON.parse(parsedContent);
  } catch (parseError) {
    console.error('Failed to parse xAI response:', parsedContent);
    throw new Error('Failed to parse command. Please try rephrasing your request.');
  }
}

async function executeAction(action: ParsedAction, context: any, supabase: any, userId: string, userRole: string): Promise<any> {
  switch (action.type) {
    case 'TASK':
      return await handleTaskAction(action, context, supabase, userId);
    case 'ISSUE':
      return await handleIssueAction(action, context, supabase, userId);
    case 'TEAM':
      return await handleTeamAction(action, context, supabase, userId, userRole);
    case 'SCOPE':
      return await handleScopeAction(action, context, supabase, userId);
    case 'COST':
      return await handleCostAction(action, context, supabase, userId);
    case 'SCHEDULE':
      return await handleScheduleAction(action, context, supabase, userId);
    case 'QUALITY':
      return await handleQualityAction(action, context, supabase, userId);
    case 'PROCUREMENT':
      return await handleProcurementAction(action, context, supabase, userId);
    default:
      throw new Error(`Unsupported action type: ${action.type}`);
  }
}

async function handleTaskAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  const { operation, entity, parameters } = action;
  
  switch (operation) {
    case 'create':
      const newTask = {
        project_id: context.projectId,
        task_name: entity,
        status: parameters.status || 'pending',
        priority: parameters.priority || 'medium',
        description: parameters.description || null,
        due_date: parameters.due_date || null,
        assigned_to_name: parameters.assignee || null,
        progress: 0
      };
      
      const { data: createdTask, error: createError } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (createError) throw createError;
      return createdTask;
      
    case 'update':
    case 'reschedule':
      const updates: any = {};
      if (parameters.due_date) updates.due_date = parameters.due_date;
      if (parameters.status) updates.status = parameters.status;
      if (parameters.priority) updates.priority = parameters.priority;
      if (parameters.assignee) updates.assigned_to_name = parameters.assignee;
      if (parameters.progress !== undefined) updates.progress = parameters.progress;
      
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('project_id', context.projectId)
        .ilike('task_name', `%${entity}%`)
        .select()
        .single();
        
      if (updateError) throw updateError;
      return updatedTask;
      
    case 'delete':
      const { data: deletedTask, error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', context.projectId)
        .ilike('task_name', `%${entity}%`)
        .select()
        .single();
        
      if (deleteError) throw deleteError;
      return deletedTask;
      
    default:
      throw new Error(`Unsupported task operation: ${operation}`);
  }
}

async function handleQualityAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  const { operation, entity, parameters } = action;
  
  switch (operation) {
    case 'create':
      const newCheck = {
        project_id: context.projectId,
        company_id: context.companyId,
        check_name: entity,
        check_type: parameters.type || 'inspection',
        status: 'pending',
        priority: parameters.priority || 'medium',
        due_date: parameters.due_date || null,
        checked_by: parameters.assignee || null,
        description: parameters.description || null
      };
      
      const { data: createdCheck, error: createError } = await supabase
        .from('quality_checks')
        .insert(newCheck)
        .select()
        .single();
        
      if (createError) throw createError;
      return createdCheck;
      
    case 'assign':
      const { data: assignedCheck, error: assignError } = await supabase
        .from('quality_checks')
        .update({ checked_by: parameters.assignee })
        .eq('project_id', context.projectId)
        .ilike('check_name', `%${entity}%`)
        .select()
        .single();
        
      if (assignError) throw assignError;
      return assignedCheck;
      
    default:
      throw new Error(`Unsupported quality operation: ${operation}`);
  }
}

async function handleScheduleAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  const { operation, parameters } = action;
  
  if (operation === 'optimize') {
    // Call schedule optimization using xAI
    const xaiApiKey = Deno.env.get('xAi');
    
    // Get current project tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', context.projectId);
      
    if (tasksError) throw tasksError;
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { 
            role: 'system', 
            content: 'You are a construction project scheduling optimizer. Analyze the tasks and suggest optimizations for timeline, dependencies, and resource allocation. Return specific recommendations in JSON format.' 
          },
          { 
            role: 'user', 
            content: `Optimize this project schedule: ${JSON.stringify(tasks)}` 
          }
        ],
        temperature: 0.3
      }),
    });
    
    const data = await response.json();
    return {
      optimization_suggestions: data.choices[0].message.content,
      task_count: tasks.length,
      timestamp: new Date().toISOString()
    };
  }
  
  throw new Error(`Unsupported schedule operation: ${operation}`);
}

async function handleIssueAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  // Placeholder for issue management
  return { message: `Issue ${action.operation} not yet implemented`, entity: action.entity };
}

async function handleTeamAction(action: ParsedAction, context: any, supabase: any, userId: string, userRole: string): Promise<any> {
  // Placeholder for team management
  return { message: `Team ${action.operation} not yet implemented`, entity: action.entity };
}

async function handleScopeAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  // Placeholder for scope management
  return { message: `Scope ${action.operation} not yet implemented`, entity: action.entity };
}

async function handleCostAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  // Placeholder for cost management
  return { message: `Cost ${action.operation} not yet implemented`, entity: action.entity };
}

async function handleProcurementAction(action: ParsedAction, context: any, supabase: any, userId: string): Promise<any> {
  // Placeholder for procurement management
  return { message: `Procurement ${action.operation} not yet implemented`, entity: action.entity };
}

async function logAction(supabase: any, actionData: any): Promise<void> {
  try {
    await supabase
      .from('skai_action_log')
      .insert({
        ...actionData,
        execution_time_ms: Date.now()
      });
  } catch (logError) {
    console.error('Failed to log action:', logError);
  }
}

function generateActionSummary(results: any[]): string {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  if (failed === 0) {
    return `✅ Successfully completed ${successful} action${successful !== 1 ? 's' : ''}`;
  } else {
    return `⚠️ Completed ${successful} action${successful !== 1 ? 's' : ''}, ${failed} failed`;
  }
}