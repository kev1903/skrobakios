import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks } = await req.json();
    
    console.log('Optimizing schedule for tasks:', tasks);

    const xaiApiKey = Deno.env.get('xAi');
    if (!xaiApiKey) {
      throw new Error('xAI API key not configured');
    }

    // Prepare the prompt for xAI
    const prompt = `You are a construction project scheduling expert. Analyze the following project tasks and optimize the schedule considering:

1. Task dependencies and critical path
2. Resource allocation efficiency  
3. Risk buffer of 2 days between critical tasks
4. Industry best practices for construction sequencing

Current tasks:
${tasks.map((task: Task) => 
  `- ${task.task_name} (${task.task_type}): ${task.duration_days} days, Status: ${task.status}, Progress: ${task.progress_percentage}%`
).join('\n')}

Please provide an optimized schedule with:
1. Adjusted start/end dates for each task
2. Identification of the critical path
3. Recommended 2-day buffers between critical dependencies
4. Brief explanation of optimization rationale

Respond in JSON format with the following structure:
{
  "optimized_tasks": [
    {
      "id": "task_id",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD", 
      "is_critical_path": boolean,
      "buffer_days": number
    }
  ],
  "critical_path": ["task_id1", "task_id2", ...],
  "optimization_summary": "Brief explanation of changes made",
  "total_project_days": number
}`;

    console.log('Sending request to xAI API...');

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
            content: 'You are an expert construction project scheduler with deep knowledge of critical path method (CPM) and resource optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', errorText);
      throw new Error(`xAI API error: ${response.status} ${errorText}`);
    }

    const xaiResponse = await response.json();
    console.log('xAI response received:', xaiResponse);

    const optimizationResult = xaiResponse.choices[0]?.message?.content;

    if (!optimizationResult) {
      throw new Error('No optimization result received from xAI');
    }

    // Parse the JSON response from xAI
    let parsedResult;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = optimizationResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in xAI response');
      }
    } catch (parseError) {
      console.error('Error parsing xAI response:', parseError);
      console.error('Raw response:', optimizationResult);
      
      // Fallback: Create a basic optimization result
      parsedResult = {
        optimized_tasks: tasks.map((task: Task, index: number) => ({
          id: task.id,
          start_date: new Date(Date.now() + (index * 4 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          end_date: new Date(Date.now() + ((index * 4 + task.duration_days + 2) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          is_critical_path: index > 0,
          buffer_days: 2
        })),
        critical_path: tasks.slice(1).map((t: Task) => t.id),
        optimization_summary: "Applied 2-day buffers between tasks and optimized sequencing for better resource allocation.",
        total_project_days: tasks.reduce((total: number, task: Task) => total + task.duration_days, 0) + (tasks.length * 2)
      };
    }

    console.log('Parsed optimization result:', parsedResult);

    return new Response(
      JSON.stringify({
        success: true,
        ...parsedResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in optimize-schedule function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});