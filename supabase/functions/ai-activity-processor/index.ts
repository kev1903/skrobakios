import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const xaiApiKey = Deno.env.get('xAi');

interface ActivityCommand {
  action: 'create' | 'update' | 'delete' | 'optimize';
  activityData?: {
    name: string;
    description?: string;
    duration?: string; // e.g., "3 days"
    start_date?: string;
    end_date?: string;
    dependencies?: string[];
    cost_est?: number;
    cost_actual?: number;
    quality_metrics?: any;
    project_id: string;
    company_id: string;
  };
  activityId?: string;
  projectId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, userId, companyId, projectId } = await req.json();
    
    console.log('Processing activity command:', { command, userId, companyId, projectId });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the natural language command using xAI
    const parsedCommand = await parseActivityCommand(command, projectId, companyId);
    console.log('Parsed command:', parsedCommand);

    let result;
    switch (parsedCommand.action) {
      case 'create':
        result = await createActivity(supabase, parsedCommand.activityData!);
        break;
      case 'update':
        result = await updateActivity(supabase, parsedCommand.activityId!, parsedCommand.activityData!);
        break;
      case 'delete':
        result = await deleteActivity(supabase, parsedCommand.activityId!);
        break;
      case 'optimize':
        result = await optimizeSchedule(supabase, parsedCommand.projectId!);
        break;
      default:
        throw new Error('Unknown action');
    }

    // Log the action
    await supabase.from('ai_chat_interactions').insert({
      user_id: userId,
      company_id: companyId,
      project_id: projectId,
      command_text: command,
      command_type: 'activity_management',
      response_summary: `Successfully ${parsedCommand.action}d activity`,
      success: true,
      context_data: { parsedCommand, result }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      action: parsedCommand.action,
      result,
      message: `Activity ${parsedCommand.action} completed successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-activity-processor:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function parseActivityCommand(command: string, projectId: string, companyId: string): Promise<ActivityCommand> {
  if (!xaiApiKey) {
    // Fallback parsing for basic commands
    return parseBasicCommand(command, projectId, companyId);
  }

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
          content: `You are an AI activity parser for SkrobakiOS project management. Parse natural language commands into structured activity operations.

Return JSON in this exact format:
{
  "action": "create|update|delete|optimize",
  "activityData": {
    "name": "string",
    "description": "string (optional)",
    "duration": "interval string like '3 days' or '2 hours'",
    "start_date": "ISO timestamp (optional)",
    "end_date": "ISO timestamp (optional)", 
    "dependencies": ["activity names or IDs"],
    "cost_est": number,
    "cost_actual": number,
    "quality_metrics": {},
    "project_id": "${projectId}",
    "company_id": "${companyId}"
  },
  "activityId": "string (for update/delete)",
  "projectId": "${projectId}"
}

Examples:
- "Create activity Site Prep: 3d, $500 cost, FS on Permits, quality check for zoning" -> create action with duration "3 days", cost_est 500, dependencies ["Permits"], quality_metrics {"zoning_check": true}
- "Update Site Prep cost to $600" -> update action with cost_est 600
- "Optimize project schedule" -> optimize action`
        },
        {
          role: 'user',
          content: command
        }
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse xAI response:', content);
    return parseBasicCommand(command, projectId, companyId);
  }
}

function parseBasicCommand(command: string, projectId: string, companyId: string): ActivityCommand {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('create') || lowerCommand.includes('add')) {
    // Extract basic info from command
    const nameMatch = command.match(/(?:create|add)\s+(?:activity\s+)?([^:,]+)/i);
    const durationMatch = command.match(/(\d+)\s*(d|day|days|h|hour|hours)/i);
    const costMatch = command.match(/\$?(\d+)/);
    
    return {
      action: 'create',
      activityData: {
        name: nameMatch?.[1]?.trim() || 'New Activity',
        description: '',
        duration: durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : undefined,
        cost_est: costMatch ? parseInt(costMatch[1]) : 0,
        cost_actual: 0,
        quality_metrics: {},
        project_id: projectId,
        company_id: companyId
      }
    };
  }
  
  if (lowerCommand.includes('optimize')) {
    return {
      action: 'optimize',
      projectId
    };
  }
  
  throw new Error('Could not parse command. Please try a more specific format.');
}

async function createActivity(supabase: any, activityData: any) {
  // Convert duration string to PostgreSQL interval
  if (activityData.duration) {
    activityData.duration = convertToInterval(activityData.duration);
  }

  const { data, error } = await supabase
    .from('activities')
    .insert(activityData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateActivity(supabase: any, activityId: string, activityData: any) {
  if (activityData.duration) {
    activityData.duration = convertToInterval(activityData.duration);
  }

  const { data, error } = await supabase
    .from('activities')
    .update(activityData)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteActivity(supabase: any, activityId: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
  return { deleted: true };
}

async function optimizeSchedule(supabase: any, projectId: string) {
  // Get all activities for the project
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;

  // Basic schedule optimization logic
  // In a real implementation, this would use more sophisticated algorithms
  const optimizedActivities = activities.map((activity: any, index: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (index * 7)); // Space activities 1 week apart
    
    const endDate = new Date(startDate);
    if (activity.duration) {
      const durationDays = parseDurationToDays(activity.duration);
      endDate.setDate(endDate.getDate() + durationDays);
    }

    return {
      ...activity,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    };
  });

  // Update all activities with optimized dates
  for (const activity of optimizedActivities) {
    await supabase
      .from('activities')
      .update({
        start_date: activity.start_date,
        end_date: activity.end_date
      })
      .eq('id', activity.id);
  }

  return { optimized: true, activities: optimizedActivities };
}

function convertToInterval(durationStr: string): string {
  const match = durationStr.match(/(\d+)\s*(d|day|days|h|hour|hours|w|week|weeks)/i);
  if (!match) return '1 day';
  
  const value = match[1];
  const unit = match[2].toLowerCase();
  
  if (unit.startsWith('h')) return `${value} hours`;
  if (unit.startsWith('w')) return `${value} weeks`;
  return `${value} days`;
}

function parseDurationToDays(interval: string): number {
  if (interval.includes('hour')) {
    const hours = parseInt(interval.match(/(\d+)/)?.[1] || '0');
    return Math.ceil(hours / 8); // 8 hour work day
  }
  if (interval.includes('week')) {
    const weeks = parseInt(interval.match(/(\d+)/)?.[1] || '0');
    return weeks * 7;
  }
  return parseInt(interval.match(/(\d+)/)?.[1] || '1');
}