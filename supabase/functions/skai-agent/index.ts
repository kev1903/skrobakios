import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const xaiApiKey = Deno.env.get('xAi');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced multi-module command execution
const executeMultiModuleCommand = async (
  commandData: any, 
  supabaseClient: any, 
  serviceClient: any,
  userId: string,
  companyId: string,
  projectId: string
) => {
  const startTime = performance.now();
  const { action, data, modules } = commandData;
  
  console.log('Executing multi-module command:', { action, modules, data });
  
  const results: any[] = [];
  const broadcastUpdates: any[] = [];
  
  try {
    switch (action) {
      case 'CREATE_TASK_WITH_COST_AND_SCHEDULE':
        // Create task
        const taskData = {
          task_name: data.task_name,
          description: data.description,
          task_type: data.task_type || 'General',
          status: data.status || 'pending',
          start_date: data.start_date,
          end_date: data.end_date,
          duration_days: data.duration_days || 1,
          progress_percentage: data.progress_percentage || 0,
          company_id: companyId
        };

        let insertedTask;
        if (projectId === '736d0991-6261-4884-8353-3522a7a98720') {
          // SK project - use sk_25008_design table
          const { data: skTask, error: taskError } = await supabaseClient
            .from('sk_25008_design')
            .insert(taskData)
            .select()
            .single();
          
          if (taskError) throw taskError;
          insertedTask = skTask;
          broadcastUpdates.push({ table: 'sk_25008_design', operation: 'INSERT', data: skTask });
        } else {
          // General project - use tasks table
          const generalTaskData = {
            ...taskData,
            project_id: projectId,
            duration: data.duration_days,
            progress: data.progress_percentage || 0,
            priority: data.priority || 'medium'
          };
          
          const { data: task, error: taskError } = await supabaseClient
            .from('tasks')
            .insert(generalTaskData)
            .select()
            .single();
          
          if (taskError) throw taskError;
          insertedTask = task;
          broadcastUpdates.push({ table: 'tasks', operation: 'INSERT', data: task });
        }
        
        results.push({ module: 'Tasks', action: 'CREATE', result: insertedTask });

        // Add cost tracking if budget provided
        if (data.budget && modules.includes('Cost')) {
          const costData = {
            cost_category: `Task: ${data.task_name}`,
            description: `Budget allocation for ${data.task_name}`,
            budget_amount: data.budget,
            allocated_amount: data.budget,
            actual_amount: 0,
            company_id: companyId,
            project_id: projectId,
            created_by: userId
          };
          
          const { data: cost, error: costError } = await supabaseClient
            .from('project_costs')
            .insert(costData)
            .select()
            .single();
          
          if (costError) throw costError;
          results.push({ module: 'Cost', action: 'CREATE', result: cost });
          broadcastUpdates.push({ table: 'project_costs', operation: 'INSERT', data: cost });
        }

        // Assign to team member if specified
        if (data.assigned_to && modules.includes('Team')) {
          const updateData = projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 
            { assigned_to_name: data.assigned_to } : { assigned_to_name: data.assigned_to };
          
          const tableName = projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 'sk_25008_design' : 'tasks';
          
          const { data: updatedTask, error: assignError } = await supabaseClient
            .from(tableName)
            .update(updateData)
            .eq('id', insertedTask.id)
            .select()
            .single();
          
          if (assignError) throw assignError;
          results.push({ module: 'Team', action: 'ASSIGN', result: updatedTask });
          broadcastUpdates.push({ table: tableName, operation: 'UPDATE', data: updatedTask });
        }

        break;

      case 'FORECAST_COST_IMPACT':
        // Analyze cost impact of schedule changes
        if (modules.includes('Cost') && modules.includes('Time')) {
          const { data: currentCosts } = await supabaseClient
            .from('project_costs')
            .select('*')
            .eq('project_id', projectId);

          const { data: currentTasks } = await supabaseClient
            .from(projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 'sk_25008_design' : 'tasks')
            .select('*')
            .eq(projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 'company_id' : 'project_id', 
                 projectId === '736d0991-6261-4884-8353-3522a7a98720' ? companyId : projectId);

          const totalBudget = currentCosts?.reduce((sum, cost) => sum + (cost.budget_amount || 0), 0) || 0;
          const delayDays = data.delay_days || 1;
          const dailyCost = totalBudget / (currentTasks?.length || 1);
          const impactCost = dailyCost * delayDays;

          results.push({
            module: 'Cost',
            action: 'FORECAST',
            result: {
              current_budget: totalBudget,
              delay_days: delayDays,
              estimated_cost_impact: impactCost,
              new_total_estimate: totalBudget + impactCost
            }
          });
        }
        break;

      case 'UPDATE_QUALITY_SCHEDULE':
        // Update quality check schedules
        if (modules.includes('Quality') && modules.includes('Time')) {
          const { data: qualityChecks } = await supabaseClient
            .from('quality_checks')
            .select('*')
            .eq('project_id', projectId);

          if (qualityChecks && qualityChecks.length > 0) {
            const updatedChecks = [];
            
            for (const check of qualityChecks) {
              if (check.due_date) {
                const newDueDate = new Date(check.due_date);
                newDueDate.setDate(newDueDate.getDate() + (data.delay_days || 1));
                
                const { data: updated, error } = await supabaseClient
                  .from('quality_checks')
                  .update({ due_date: newDueDate.toISOString().split('T')[0] })
                  .eq('id', check.id)
                  .select()
                  .single();
                
                if (!error) {
                  updatedChecks.push(updated);
                  broadcastUpdates.push({ table: 'quality_checks', operation: 'UPDATE', data: updated });
                }
              }
            }
            
            results.push({ module: 'Quality', action: 'UPDATE_SCHEDULE', result: updatedChecks });
          }
        }
        break;

      case 'DELETE_ALL_TASKS':
        // Delete all tasks and related data
        const tableName = projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 'sk_25008_design' : 'tasks';
        const filterField = projectId === '736d0991-6261-4884-8353-3522a7a98720' ? 'company_id' : 'project_id';
        const filterValue = projectId === '736d0991-6261-4884-8353-3522a7a98720' ? companyId : projectId;

        // Get all tasks before deletion
        const { data: tasksToDelete } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq(filterField, filterValue);

        // Delete all tasks
        const { error: deleteError } = await supabaseClient
          .from(tableName)
          .delete()
          .eq(filterField, filterValue);

        if (deleteError) throw deleteError;

        // Broadcast deletions
        if (tasksToDelete) {
          for (const task of tasksToDelete) {
            broadcastUpdates.push({ table: tableName, operation: 'DELETE', data: { id: task.id, old: task } });
          }
        }

        results.push({ 
          module: 'Tasks', 
          action: 'DELETE_ALL', 
          result: { deleted_count: tasksToDelete?.length || 0 } 
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Store action in memory
    await updateSkaiMemory(serviceClient, userId, companyId, projectId, {
      action,
      data,
      modules,
      results,
      timestamp: new Date().toISOString()
    });

    // Broadcast all updates
    for (const update of broadcastUpdates) {
      await broadcastUpdate(supabaseClient, update.table, update.operation, update.data);
    }

    const executionTime = performance.now() - startTime;

    // Log action
    await serviceClient
      .from('skai_action_log')
      .insert({
        user_id: userId,
        company_id: companyId,
        project_id: projectId,
        action_type: action,
        action_description: `Multi-module action: ${action}`,
        command_data: commandData,
        execution_result: { results, execution_time_ms: executionTime },
        execution_time_ms: Math.round(executionTime),
        success: true
      });

    return {
      success: true,
      message: `Successfully executed ${action} across ${modules.join(', ')} modules`,
      results,
      execution_time_ms: Math.round(executionTime)
    };

  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    console.error('Multi-module command execution error:', error);
    
    // Log failed action
    await serviceClient
      .from('skai_action_log')
      .insert({
        user_id: userId,
        company_id: companyId,
        project_id: projectId,
        action_type: action,
        action_description: `Failed multi-module action: ${action}`,
        command_data: commandData,
        execution_result: { error: error.message },
        execution_time_ms: Math.round(executionTime),
        success: false,
        error_message: error.message
      });

    return {
      success: false,
      error: error.message,
      execution_time_ms: Math.round(executionTime)
    };
  }
};

// Update Skai memory with learning and context
const updateSkaiMemory = async (
  serviceClient: any,
  userId: string,
  companyId: string,
  projectId: string,
  actionData: any
) => {
  try {
    const { data: existingMemory } = await serviceClient
      .from('skai_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('project_id', projectId)
      .single();

    if (existingMemory) {
      // Update existing memory
      const updatedHistory = [...(existingMemory.action_history || []), actionData];
      const updatedContext = {
        ...existingMemory.conversation_context,
        last_action: actionData.action,
        last_action_time: actionData.timestamp
      };

      await serviceClient
        .from('skai_memory')
        .update({
          action_history: updatedHistory.slice(-50), // Keep last 50 actions
          conversation_context: updatedContext,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMemory.id);
    } else {
      // Create new memory
      await serviceClient
        .from('skai_memory')
        .insert({
          user_id: userId,
          company_id: companyId,
          project_id: projectId,
          action_history: [actionData],
          conversation_context: {
            last_action: actionData.action,
            last_action_time: actionData.timestamp
          }
        });
    }
  } catch (error) {
    console.error('Failed to update Skai memory:', error);
  }
};

// Broadcast real-time updates
const broadcastUpdate = async (supabaseClient: any, table: string, operation: string, data: any) => {
  try {
    const channel = supabaseClient.channel(`skai_broadcast_${Date.now()}`);
    await channel.send({
      type: 'broadcast',
      event: 'skai_update',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Skai Agent Function Started ===');
    
    const authHeader = req.headers.get('authorization');
    const apikey = req.headers.get('apikey');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Please log in to use Skai'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    
    // Create clients
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader, apikey: apikey || supabaseAnonKey } },
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Verify user
    const { data: { user }, error: authError } = await serviceClient.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        details: 'Invalid authentication token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, command } = await req.json();

    if (!xaiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'AI service not configured',
        details: 'Please configure the xAI API key'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's company
    const { data: companies } = await supabaseClient
      .from('companies')
      .select('id, name')
      .eq('company_members.user_id', user.id)
      .eq('company_members.status', 'active')
      .limit(1);

    const companyId = companies?.[0]?.id;
    if (!companyId) {
      return new Response(JSON.stringify({ 
        error: 'No active company found',
        details: 'You must be a member of an active company to use Skai'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Skai memory for context
    const { data: memory } = await serviceClient
      .from('skai_memory')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .eq('project_id', context?.projectId)
      .single();

    // If command provided, execute directly
    if (command) {
      console.log('Executing direct command:', command);
      const result = await executeMultiModuleCommand(
        command, 
        supabaseClient, 
        serviceClient,
        user.id, 
        companyId, 
        context?.projectId || null
      );
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced system prompt for multi-module reasoning
    const systemPrompt = `You are Skai, an advanced AI agent for SkrobakiOS construction management. You can execute actions across multiple modules simultaneously.

AVAILABLE MODULES:
- Tasks: Create, update, delete, assign tasks
- Cost: Budget tracking, cost forecasting, financial impact analysis
- Time/Scheduling: Timeline management, delay analysis, schedule optimization
- Quality: Quality checks, compliance tracking, inspection scheduling
- Team: Member assignment, workload management, notifications
- Scope: Project scope management, change requests
- Procurement: Material ordering, supplier management

MULTI-MODULE CAPABILITIES:
You can execute complex commands that span multiple modules. For example:
- "Add task for site inspection Jul 20, assign to John, budget $500" → Create task + assign team member + add cost tracking
- "Delay quality check by 1 day and forecast cost impact" → Update quality schedule + analyze cost impact
- "Create foundation task, assign to Sarah, budget $2000, due in 5 days" → Tasks + Team + Cost + Time modules

USER CONTEXT:
- User ID: ${user.id}
- Company ID: ${companyId}
- Project ID: ${context?.projectId || 'Not specified'}
- Current Page: ${context?.currentPage || 'Unknown'}

PREVIOUS ACTIONS: ${memory?.action_history ? JSON.stringify(memory.action_history.slice(-5)) : 'None'}

COMMAND PATTERNS:
For multi-module actions, respond with:
EXECUTE_COMMAND: {
  "action": "CREATE_TASK_WITH_COST_AND_SCHEDULE",
  "modules": ["Tasks", "Cost", "Team"],
  "data": {
    "task_name": "Site inspection",
    "start_date": "2024-07-20",
    "assigned_to": "John Smith",
    "budget": 500,
    "duration_days": 1
  }
}

For forecasting:
EXECUTE_COMMAND: {
  "action": "FORECAST_COST_IMPACT", 
  "modules": ["Cost", "Time"],
  "data": {"delay_days": 1}
}

For quality schedule updates:
EXECUTE_COMMAND: {
  "action": "UPDATE_QUALITY_SCHEDULE",
  "modules": ["Quality", "Time"], 
  "data": {"delay_days": 1}
}

For deleting all tasks:
EXECUTE_COMMAND: {
  "action": "DELETE_ALL_TASKS",
  "modules": ["Tasks"],
  "data": {}
}

RESPONSE STYLE:
- Be conversational and helpful
- Explain what actions you're taking across which modules
- Provide clear feedback on execution results
- Handle errors gracefully with suggestions
- Remember context from previous interactions`;

    // Call xAI API for reasoning
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Process commands - improved JSON parsing
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
        console.log('Executing AI command:', commandData);
        
        const commandResult = await executeMultiModuleCommand(
          commandData, 
          supabaseClient, 
          serviceClient,
          user.id, 
          companyId, 
          context?.projectId || null
        );
        
        if (commandResult.success) {
          aiResponse += `\n\n✅ **Command executed successfully across ${commandData.modules?.join(', ') || 'multiple'} modules:**\n`;
          aiResponse += `${commandResult.message}\n`;
          if (commandResult.results) {
            for (const result of commandResult.results) {
              aiResponse += `- ${result.module}: ${result.action}\n`;
            }
          }
          aiResponse += `*Execution time: ${commandResult.execution_time_ms}ms*`;
        } else {
          aiResponse += `\n\n❌ **Command failed:** ${commandResult.error}`;
        }
      } catch (cmdError) {
        console.error('Command processing error:', cmdError);
        aiResponse += `\n\n❌ **Command processing error:** ${cmdError.message}`;
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Skai Agent error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable',
      details: 'An unexpected error occurred. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});