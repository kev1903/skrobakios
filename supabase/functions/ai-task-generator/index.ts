import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { prompt, projectId, context } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const systemPrompt = `You are Skai, an AI assistant that helps with project management and task creation. 

When given a description of work that needs to be done, break it down into specific, actionable tasks. Each task should be:
- Clear and specific
- Achievable by a single person
- Have a realistic time estimate
- Include relevant details in the description

Respond with a JSON object containing a "tasks" array where each task has:
- task_name: string (concise, actionable title)
- description: string (detailed description of what needs to be done)
- priority: "low" | "medium" | "high" 
- category: string (e.g., "development", "design", "testing", "documentation", "planning")
- duration: number (estimated hours)

Example format:
{
  "tasks": [
    {
      "task_name": "Set up React project structure",
      "description": "Initialize a new React project with TypeScript, configure build tools, and set up basic folder structure",
      "priority": "high",
      "category": "development",
      "duration": 2
    }
  ]
}

Keep the response practical and focused on real, implementable tasks.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Break down this work into specific tasks: ${prompt}` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let parsedTasks;
    try {
      parsedTasks = JSON.parse(generatedContent);
    } catch (parseError) {
      // If parsing fails, try to extract tasks from the response
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response',
          rawResponse: generatedContent 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate the response structure
    if (!parsedTasks.tasks || !Array.isArray(parsedTasks.tasks)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from AI',
          parsedTasks 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Ensure each task has all required fields
    const validatedTasks = parsedTasks.tasks.map((task: any) => ({
      task_name: task.task_name || 'Untitled Task',
      description: task.description || 'No description provided',
      priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
      category: task.category || 'general',
      duration: typeof task.duration === 'number' && task.duration > 0 ? task.duration : 1,
    }));

    return new Response(
      JSON.stringify({ 
        tasks: validatedTasks,
        prompt,
        projectId,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-task-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Internal server error while generating tasks'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});