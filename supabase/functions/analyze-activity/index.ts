import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const xaiApiKey = Deno.env.get('OPENAI_API_KEY'); // Using same env var name for compatibility

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-vision-beta',
        messages: [
          {
            role: 'system',
            content: `Analyze this screenshot and determine the user's current activity. Return a JSON object with:
            - activity: brief description of what they're doing (e.g., "Email Management", "Code Review", "Meeting")
            - category: one of ["Deep Work", "Admin", "Calls", "Design", "Break", "Other"]  
            - project: project name if identifiable from context, or null
            
            Be specific but concise. Focus on productive work activities.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 150
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse AI response as JSON
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = { activity: 'Computer Work', category: 'Other', project: null };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing activity:', error);
    return new Response(
      JSON.stringify({ activity: 'Other', category: 'Other', project: null }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});