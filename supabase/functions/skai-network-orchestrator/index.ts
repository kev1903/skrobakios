import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NetworkNode {
  id: string;
  task_name: string;
  duration_days: number;
  progress_percentage: number;
  status: string;
  position_x: number;
  position_y: number;
  position_z: number;
}

interface NetworkDependency {
  id: string;
  predecessor_node_id: string;
  successor_node_id: string;
  dependency_type: string;
  lag_days: number;
  criticality: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authorization = req.headers.get('Authorization');
    if (authorization) {
      supabaseClient.auth.setAuth(authorization.replace('Bearer ', ''));
    }

    const { action, projectId, message, nodes, dependencies, simulationData } = await req.json();

    const xAiApiKey = Deno.env.get('xAi');
    if (!xAiApiKey) {
      throw new Error('xAI API key not configured');
    }

    switch (action) {
      case 'parse_prompt':
        return await parsePromptToNetwork(message, projectId, supabaseClient, xAiApiKey);
      
      case 'optimize_network':
        return await optimizeNetwork(projectId, nodes, dependencies, supabaseClient, xAiApiKey);
      
      case 'simulate_changes':
        return await simulateChanges(projectId, simulationData, supabaseClient, xAiApiKey);
      
      case 'generate_suggestions':
        return await generateSuggestions(projectId, nodes, dependencies, supabaseClient, xAiApiKey);
      
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in Skai Network Orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function parsePromptToNetwork(
  message: string,
  projectId: string,
  supabaseClient: any,
  xAiApiKey: string
) {
  const prompt = `
Parse this construction project message into a structured network of tasks and dependencies:
"${message}"

Return a JSON object with this exact structure:
{
  "nodes": [
    {
      "task_name": "string",
      "description": "string",
      "duration_days": number,
      "position_x": number (random between -10 and 10),
      "position_y": number (random between -10 and 10),
      "position_z": number (random between -10 and 10),
      "node_type": "task",
      "color": "#hex_color"
    }
  ],
  "dependencies": [
    {
      "predecessor_task": "exact task name",
      "successor_task": "exact task name", 
      "dependency_type": "FS|SS|FF|SF",
      "lag_days": number,
      "criticality": number (0-1)
    }
  ]
}

Focus on construction-specific tasks like site prep, foundation, framing, etc.
Use realistic durations and identify logical dependencies.
`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a construction project management AI. Parse user requests into structured task networks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const aiData = await response.json();
  const parsedContent = JSON.parse(aiData.choices[0].message.content);

  // Create nodes in database
  const nodePromises = parsedContent.nodes.map(async (node: any) => {
    const { data, error } = await supabaseClient
      .from('project_network_nodes')
      .insert({
        project_id: projectId,
        task_name: node.task_name,
        description: node.description,
        duration_days: node.duration_days,
        position_x: node.position_x,
        position_y: node.position_y,
        position_z: node.position_z,
        node_type: node.node_type,
        color: node.color,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  });

  const createdNodes = await Promise.all(nodePromises);

  // Create dependencies
  const depPromises = parsedContent.dependencies.map(async (dep: any) => {
    const predNode = createdNodes.find(n => n.task_name === dep.predecessor_task);
    const succNode = createdNodes.find(n => n.task_name === dep.successor_task);
    
    if (!predNode || !succNode) return null;

    const { data, error } = await supabaseClient
      .from('project_network_dependencies')
      .insert({
        project_id: projectId,
        predecessor_node_id: predNode.id,
        successor_node_id: succNode.id,
        dependency_type: dep.dependency_type,
        lag_days: dep.lag_days,
        criticality: dep.criticality,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  });

  const createdDeps = await Promise.all(depPromises);

  return new Response(
    JSON.stringify({
      success: true,
      nodes: createdNodes,
      dependencies: createdDeps.filter(d => d !== null),
      aiResponse: aiData.choices[0].message.content,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function optimizeNetwork(
  projectId: string,
  nodes: NetworkNode[],
  dependencies: NetworkDependency[],
  supabaseClient: any,
  xAiApiKey: string
) {
  const prompt = `
Optimize this construction project network for efficiency:

Nodes: ${JSON.stringify(nodes)}
Dependencies: ${JSON.stringify(dependencies)}

Analyze and provide:
1. Critical path identification
2. Resource optimization suggestions
3. Schedule compression opportunities
4. Risk mitigation recommendations
5. Updated node positions for better 3D layout

Return JSON with optimization suggestions and updated node positions.
`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a construction project optimization AI. Analyze networks and provide actionable improvements.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  const aiData = await response.json();

  // Update AI state in database
  await supabaseClient
    .from('project_network_ai_state')
    .upsert({
      project_id: projectId,
      optimization_history: supabaseClient.rpc('array_append', {
        array_val: [],
        new_val: {
          timestamp: new Date().toISOString(),
          optimization_result: aiData.choices[0].message.content,
        }
      }),
      last_ai_update: new Date().toISOString(),
    });

  return new Response(
    JSON.stringify({
      success: true,
      optimization: JSON.parse(aiData.choices[0].message.content),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function simulateChanges(
  projectId: string,
  simulationData: any,
  supabaseClient: any,
  xAiApiKey: string
) {
  const prompt = `
Simulate the impact of these changes on the construction project:
${JSON.stringify(simulationData)}

Calculate:
1. Schedule impact (delays/accelerations)
2. Resource reallocation needs
3. Cost implications
4. Quality/safety considerations
5. Ripple effects on other tasks

Return detailed simulation results with quantified impacts.
`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a construction project simulation AI. Model the impact of changes accurately.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    }),
  });

  const aiData = await response.json();

  // Update simulation state
  await supabaseClient
    .from('project_network_ai_state')
    .upsert({
      project_id: projectId,
      simulation_state: JSON.parse(aiData.choices[0].message.content),
      last_ai_update: new Date().toISOString(),
    });

  return new Response(
    JSON.stringify({
      success: true,
      simulation: JSON.parse(aiData.choices[0].message.content),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function generateSuggestions(
  projectId: string,
  nodes: NetworkNode[],
  dependencies: NetworkDependency[],
  supabaseClient: any,
  xAiApiKey: string
) {
  const prompt = `
Based on this construction project network, generate proactive suggestions:

Nodes: ${JSON.stringify(nodes)}
Dependencies: ${JSON.stringify(dependencies)}

Provide suggestions for:
1. Weather contingency planning
2. Resource optimization
3. Quality control checkpoints
4. Safety milestone integration
5. Efficiency improvements

Return actionable suggestions with priority rankings.
`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are a proactive construction AI assistant. Generate helpful, practical suggestions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    }),
  });

  const aiData = await response.json();

  // Update suggestions
  await supabaseClient
    .from('project_network_ai_state')
    .upsert({
      project_id: projectId,
      ai_suggestions: JSON.parse(aiData.choices[0].message.content),
      last_ai_update: new Date().toISOString(),
    });

  return new Response(
    JSON.stringify({
      success: true,
      suggestions: JSON.parse(aiData.choices[0].message.content),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}