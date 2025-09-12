import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define allowed operations and tables for security
const ALLOWED_OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
const ALLOWED_TABLES = [
  'wbs_items',
  'projects', 
  'tasks',
  'project_costs',
  'activities',
  'stakeholders',
  'project_documents'
];

// Helper function to validate and sanitize database operations
function validateOperation(operation: string, table: string): boolean {
  return ALLOWED_OPERATIONS.includes(operation.toUpperCase()) && 
         ALLOWED_TABLES.includes(table);
}

// Helper function to get user's companies for security filtering
async function getUserCompanies(supabase: any, userId: string) {
  const { data: companyMembers } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  return companyMembers?.map(cm => cm.company_id) || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { prompt, projectId, context = {} } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('SkAi Database Operation Request:', { prompt, projectId, userId: user.id });

    // Get user's companies for security filtering
    const userCompanies = await getUserCompanies(supabase, user.id);
    
    if (userCompanies.length === 0) {
      throw new Error('User is not a member of any companies');
    }

    // Enhanced system prompt for database operations
    const systemPrompt = `You are SkAi, an AI assistant that performs database operations for construction project management.

CRITICAL INSTRUCTIONS:
1. You can ONLY perform operations on these tables: ${ALLOWED_TABLES.join(', ')}
2. You can ONLY perform these operations: ${ALLOWED_OPERATIONS.join(', ')}
3. You MUST always include company_id filtering for user security
4. You MUST validate that the user has access to the project/data
5. Always use parameterized queries to prevent SQL injection

AVAILABLE USER COMPANIES: ${userCompanies.join(', ')}
CURRENT PROJECT ID: ${projectId || 'Not specified'}

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no extra text.

REQUIRED JSON FORMAT (respond with ONLY this structure):
{
  "operation": "UPDATE|INSERT|DELETE|SELECT",
  "table": "table_name", 
  "data": {...},
  "filters": {...},
  "explanation": "Brief explanation",
  "requiresConfirmation": false
}

For WBS items, use these fields:
- title: string (required)
- description: string
- project_id: "${projectId}"
- company_id: "${userCompanies[0]}"
- wbs_id: "auto-generated like 1.2.X"
- category: string 
- status: "planned"
- progress: 0
- level: number (0 for top level, 1 for sub-items)

For adding to "Demolition", find existing demolition WBS items as parent_id.

Current context: ${JSON.stringify(context)}`;

    // Call OpenAI to interpret the database operation request
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
          { role: 'user', content: `${prompt}

RESPOND WITH ONLY JSON. NO OTHER TEXT.` }
        ],
        max_tokens: 500,
        temperature: 0.0, // Zero temperature for consistent JSON responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;

    console.log('AI Database Operation Response:', aiContent);

    // Try to parse the AI response as JSON
    let operationPlan;
    try {
      // Clean the response by removing markdown code blocks and extra text
      let cleanResponse = aiContent.trim();
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = cleanResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[1];
      }
      
      // Find JSON object if it's embedded in other text
      const jsonObjectMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        cleanResponse = jsonObjectMatch[0];
      }
      
      operationPlan = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiContent);
      return new Response(JSON.stringify({
        success: false,
        error: 'AI response was not in expected JSON format',
        aiResponse: aiContent,
        parseError: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the operation plan
    if (!validateOperation(operationPlan.operation, operationPlan.table)) {
      throw new Error(`Invalid operation: ${operationPlan.operation} on table ${operationPlan.table}`);
    }

    // Execute the database operation
    let result;
    const table = operationPlan.table;
    
    // Add security filtering for company access
    const securityFilter = userCompanies.length === 1 
      ? { company_id: userCompanies[0] }
      : { company_id: { in: userCompanies } };

    switch (operationPlan.operation.toUpperCase()) {
      case 'SELECT':
        const selectQuery = supabase.from(table).select('*');
        if (operationPlan.filters) {
          Object.entries(operationPlan.filters).forEach(([key, value]) => {
            selectQuery.eq(key, value);
          });
        }
        // Always add company security filter
        if (operationPlan.table !== 'projects') { // projects might not have company_id directly
          selectQuery.in('company_id', userCompanies);
        }
        result = await selectQuery;
        break;

      case 'INSERT':
        // Ensure company_id is set for security
        if (!operationPlan.data.company_id && userCompanies.length > 0) {
          operationPlan.data.company_id = userCompanies[0];
        }
        result = await supabase.from(table).insert(operationPlan.data).select();
        break;

      case 'UPDATE':
        const updateQuery = supabase.from(table).update(operationPlan.data);
        if (operationPlan.filters) {
          Object.entries(operationPlan.filters).forEach(([key, value]) => {
            updateQuery.eq(key, value);
          });
        }
        // Always add company security filter for updates
        updateQuery.in('company_id', userCompanies);
        result = await updateQuery.select();
        break;

      case 'DELETE':
        const deleteQuery = supabase.from(table).delete();
        if (operationPlan.filters) {
          Object.entries(operationPlan.filters).forEach(([key, value]) => {
            deleteQuery.eq(key, value);
          });
        }
        // Always add company security filter for deletes
        deleteQuery.in('company_id', userCompanies);
        result = await deleteQuery;
        break;

      default:
        throw new Error(`Unsupported operation: ${operationPlan.operation}`);
    }

    if (result.error) {
      console.error('Database operation error:', result.error);
      throw new Error(`Database operation failed: ${result.error.message}`);
    }

    // Log the successful operation
    await supabase.from('ai_chat_interactions').insert({
      user_id: user.id,
      company_id: userCompanies[0],
      project_id: projectId,
      command_text: prompt,
      response_summary: `Database operation: ${operationPlan.operation} on ${operationPlan.table}`,
      context_data: {
        operation: operationPlan.operation,
        table: operationPlan.table,
        recordsAffected: result.data?.length || 0
      },
      success: true,
      execution_time_ms: Date.now()
    });

    return new Response(JSON.stringify({
      success: true,
      operation: operationPlan.operation,
      table: operationPlan.table,
      explanation: operationPlan.explanation,
      data: result.data,
      recordsAffected: result.data?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in SkAi database operations:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Failed to process SkAi database operation request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});