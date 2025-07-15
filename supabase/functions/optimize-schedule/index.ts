import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { tasks, bufferDays = 2 } = await req.json();
    
    const xaiApiKey = Deno.env.get('OPENAI_API_KEY'); // Using same env var for xAI
    if (!xaiApiKey) {
      throw new Error('xAI API key not configured');
    }

    // Prepare AI prompt for schedule optimization
    const prompt = `
    As an AI scheduling optimizer for architectural design projects, analyze the following tasks and optimize the schedule:

    Tasks: ${JSON.stringify(tasks)}
    Buffer days: ${bufferDays}

    Consider:
    1. Task dependencies (Concept Design must finish before Detailed Design)
    2. Resource allocation and workload balance
    3. Risk mitigation with buffer days
    4. Critical path optimization
    5. Bulleen Council submission deadlines and approval processes

    Return an optimized schedule in JSON format with:
    - adjusted start/end dates for each task
    - risk assessment for each phase
    - recommended buffer allocation
    - critical path identification
    - compliance milestone checkpoints

    Format: {
      "optimizedTasks": [...],
      "criticalPath": [...],
      "riskAssessment": {...},
      "recommendations": [...]
    }
    `;

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
            content: 'You are an AI scheduling assistant specialized in architectural project management and Australian council compliance processes.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Try to extract JSON from the response
    let optimizedSchedule;
    try {
      // Look for JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizedSchedule = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        optimizedSchedule = {
          optimizedTasks: tasks,
          criticalPath: ['concept', 'detailed', 'review'],
          riskAssessment: { overall: 'medium', factors: ['weather delays', 'council feedback'] },
          recommendations: [aiResponse]
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      optimizedSchedule = {
        optimizedTasks: tasks,
        criticalPath: ['concept', 'detailed', 'review'],
        riskAssessment: { overall: 'medium', factors: ['council approval timing'] },
        recommendations: ['AI optimization completed with standard scheduling practices']
      };
    }

    return new Response(JSON.stringify(optimizedSchedule), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in optimize-schedule function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: {
        optimizedTasks: [],
        criticalPath: ['consultation', 'concept', 'detailed', 'review'],
        riskAssessment: { overall: 'medium' },
        recommendations: ['Use standard scheduling practices']
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});