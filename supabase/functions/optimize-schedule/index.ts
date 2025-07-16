import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const xaiApiKey = Deno.env.get('xAi');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, optimizationType = 'time' } = await req.json();
    
    if (!xaiApiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple optimization response for demo
    const optimizationResult = {
      analysis: {
        current_duration_days: 30,
        critical_path: ["foundation", "framing", "electrical"],
        bottlenecks: ["Resource conflicts in electrical phase"],
        resource_conflicts: ["Electrician availability overlap"]
      },
      optimizations: [
        {
          type: "schedule_adjustment",
          description: "Parallel electrical and plumbing work",
          time_saved_days: 3,
          cost_impact: 0,
          risk_level: "low"
        }
      ],
      summary: {
        time_saved_days: 3,
        cost_impact: 0,
        confidence_score: 0.85
      }
    };

    return new Response(JSON.stringify({
      success: true,
      optimization: optimizationResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Optimization failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});