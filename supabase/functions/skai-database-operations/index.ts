import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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
  
  return companyMembers?.map((cm: any) => cm.company_id) || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lovableApiKey || !supabaseUrl || !supabaseServiceKey) {
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

    // CRITICAL: Verify the project belongs to one of user's companies
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, company_id, name')
      .eq('id', projectId)
      .in('company_id', userCompanies)
      .single();

    if (projectError || !projectData) {
      throw new Error('Project not found or access denied');
    }

    const projectCompanyId = projectData.company_id;

    // Get existing WBS items for context - using the project's actual company_id
    const { data: existingWbsItems } = await supabase
      .from('wbs_items')
      .select('id, wbs_id, title, category, level, parent_id')
      .eq('project_id', projectId)
      .eq('company_id', projectCompanyId)
      .order('level', { ascending: true })
      .order('wbs_id', { ascending: true });

    const wbsContext = existingWbsItems || [];

    // Enhanced system prompt for database operations with STRICT project isolation
    const systemPrompt = `You are SkAi, a world-class construction project manager with in-depth knowledge of Australian construction regulations, construction methodology, trades sequencing, and industry best practices. You perform database operations for construction project management with expertise and precision.

CRITICAL PROJECT ISOLATION RULES:
- You are ONLY working with project: ${projectData.name} (ID: ${projectId})
- This project is located at: ${projectData.name}
- Company ID for this project: ${projectCompanyId}
- You MUST NEVER reference any other project or location
- You MUST NEVER use data from other projects

CRITICAL INSTRUCTIONS:
1. You can ONLY perform operations on these tables: ${ALLOWED_TABLES.join(', ')}
2. You can ONLY perform these operations: ${ALLOWED_OPERATIONS.join(', ')}
3. You MUST always include company_id filtering for user security
4. You MUST validate that the user has access to the project/data
5. Always use parameterized queries to prevent SQL injection
6. You MUST ONLY work with data from project: ${projectData.name}

CURRENT PROJECT CONTEXT:
- Project Name: ${projectData.name}
- Project ID: ${projectId}
- Company ID: ${projectCompanyId}
- User Companies: ${userCompanies.join(', ')}

EXISTING WBS ITEMS IN THIS PROJECT ONLY:
${wbsContext.length > 0 
  ? wbsContext.map(item => `- ID: ${item.id}, WBS: ${item.wbs_id}, Title: "${item.title}", Category: ${item.category || 'N/A'}, Level: ${item.level}, Parent: ${item.parent_id || 'None'}`).join('\n')
  : 'NO EXISTING WBS ITEMS - Start with top-level items (parent_id = null)'}

CRITICAL PARENT_ID RULES:
- You can ONLY use parent_id values that exist in the list above
- If the parent you want doesn't exist yet, you MUST create it first as a separate operation
- If there are no existing WBS items, ALWAYS use parent_id = null for the first items you create
- NEVER use parent_id values that are not in the existing WBS items list above
- NEVER generate or guess parent_id values

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no code blocks, no extra text.

BATCH OPERATIONS SUPPORT:
- You CAN add multiple WBS items in a single operation
- For multiple items, use an array in the "data" field
- Make sure to generate sequential wbs_id values for multiple items
- All items in a batch must be at the same level with the same parent
  
REQUIRED JSON FORMAT (respond with ONLY this structure):

For SINGLE item:
{
  "operation": "INSERT",
  "table": "wbs_items",
  "data": {
    "title": "exact title",
    "description": "brief description",
    "project_id": "${projectId}",
    "company_id": "${projectCompanyId}",
    "wbs_id": "auto-generate next available like 1.2.X",
    "category": "Stage|Component|Element",
    "status": "Not Started",
    "progress": 0,
    "level": 1,
    "parent_id": "use actual UUID from existing WBS items above, or null for top level"
  },
  "explanation": "Brief explanation for project ${projectData.name} only"
}

For MULTIPLE items (use array):
{
  "operation": "INSERT",
  "table": "wbs_items",
  "data": [
    {
      "title": "first item title",
      "description": "brief description",
      "project_id": "${projectId}",
      "company_id": "${projectCompanyId}",
      "wbs_id": "1",
      "category": "Stage",
      "status": "Not Started",
      "progress": 0,
      "level": 1,
      "parent_id": null
    },
    {
      "title": "second item title",
      "description": "brief description",
      "project_id": "${projectId}",
      "company_id": "${projectCompanyId}",
      "wbs_id": "2",
      "category": "Stage",
      "status": "Not Started",
      "progress": 0,
      "level": 1,
      "parent_id": null
    }
  ],
  "explanation": "Brief explanation mentioning all items added for project ${projectData.name}"
}

CRITICAL WBS CATEGORY RULES:
- ONLY use these exact category values: "Stage", "Component", "Element"
- "Stage" = Major project phases (e.g., Planning, Execution, Completion)
- "Component" = Major building systems (e.g., Structure, MEP, Finishes)  
- "Element" = Specific work items (e.g., Foundation, Walls, HVAC)

RULES FOR PARENT_ID:
- CRITICAL: Only use parent_id values from the EXISTING WBS ITEMS list above
- If adding to "Demolition", find the demolition WBS item ID from the list above
- Use the actual UUID from existing items, never use SELECT statements
- If the desired parent doesn't exist yet, use null and create it first
- If NO existing items exist, ALWAYS use parent_id = null for new items

RULES FOR WBS_ID:
- Generate next sequential number (e.g., if 1.2.1 exists, use 1.2.2)
- For sub-items under parent, use parent's pattern + next number

Current context: ${JSON.stringify(context)}

REMEMBER: You are ONLY working with project "${projectData.name}" - never reference any other project or location.`;

    // Call Lovable AI (Gemini) to interpret the database operation request
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}

RESPOND WITH ONLY JSON. NO OTHER TEXT.` }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI API error:', response.status, errorData);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits required. Please add credits to your Lovable workspace.');
      }
      
      throw new Error(`Lovable AI API error: ${response.status} ${response.statusText}`);
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
        console.log('Extracted JSON from code block');
      }
      
      // Find JSON object if it's embedded in other text
      const jsonObjectMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        cleanResponse = jsonObjectMatch[0];
      }
      
      console.log('Cleaned response for parsing:', cleanResponse.substring(0, 200));
      operationPlan = JSON.parse(cleanResponse);
      console.log('Successfully parsed operation plan:', operationPlan.operation, 'on', operationPlan.table);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiContent);
      return new Response(JSON.stringify({
        success: false,
        error: 'AI response was not in expected JSON format',
        aiResponse: aiContent,
        parseError: (parseError as Error).message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the operation plan
    console.log('Validating operation:', operationPlan.operation, 'on table:', operationPlan.table);
    if (!validateOperation(operationPlan.operation, operationPlan.table)) {
      console.error('Invalid operation rejected');
      throw new Error(`Invalid operation: ${operationPlan.operation} on table ${operationPlan.table}`);
    }
    console.log('Operation validated successfully');

    // Execute the database operation
    console.log('Executing database operation...');
    let result;
    const table = operationPlan.table;
    
    // Add security filtering for company access - use project's company
    const securityFilter = { company_id: projectCompanyId };

    switch (operationPlan.operation.toUpperCase()) {
      case 'SELECT':
        const selectQuery = supabase.from(table).select('*');
        if (operationPlan.filters) {
          Object.entries(operationPlan.filters).forEach(([key, value]) => {
            selectQuery.eq(key, value);
          });
        }
        // Always add company security filter using project's company
        if (operationPlan.table !== 'projects') {
          selectQuery.eq('company_id', projectCompanyId);
        }
        result = await selectQuery;
        break;

      case 'INSERT':
        // Handle both single objects and arrays for batch inserts
        const dataToInsert = Array.isArray(operationPlan.data) ? operationPlan.data : [operationPlan.data];
        
        // Validate and auto-correct categories for wbs_items table
        if (operationPlan.table === 'wbs_items') {
          const validCategories = ['Stage', 'Component', 'Element'];
          dataToInsert.forEach((item: any) => {
            if (item.category && !validCategories.includes(item.category)) {
              // Auto-correct invalid categories to appropriate defaults
              if (item.title?.toLowerCase().includes('phase') || 
                  item.title?.toLowerCase().includes('stage')) {
                item.category = 'Stage';
              } else if (item.level === 1) {
                item.category = 'Component';  // Top-level items are typically components
              } else {
                item.category = 'Element';    // Sub-items are typically elements
              }
              console.log(`Auto-corrected invalid category to: ${item.category} for item: ${item.title}`);
            }
            
            // Ensure company_id is set for security using project's company
            if (!item.company_id) {
              item.company_id = projectCompanyId;
            }
          });
        }
        
        console.log('Inserting data:', JSON.stringify(dataToInsert));
        result = await supabase.from(table).insert(dataToInsert).select();
        console.log('Insert result:', { error: result.error, count: result.data?.length });
        break;

      case 'UPDATE':
        // Validate category for wbs_items table updates
        if (operationPlan.table === 'wbs_items' && operationPlan.data.category) {
          const validCategories = ['Stage', 'Component', 'Element'];
          if (!validCategories.includes(operationPlan.data.category)) {
            // Auto-correct invalid categories to appropriate defaults
            if (operationPlan.data.title?.toLowerCase().includes('phase') || 
                operationPlan.data.title?.toLowerCase().includes('stage')) {
              operationPlan.data.category = 'Stage';
            } else {
              operationPlan.data.category = 'Component';  // Default for updates
            }
            console.log(`Auto-corrected invalid category to: ${operationPlan.data.category}`);
          }
        }
        
        const updateQuery = supabase.from(table).update(operationPlan.data);
        if (operationPlan.filters) {
          Object.entries(operationPlan.filters).forEach(([key, value]) => {
            updateQuery.eq(key, value);
          });
        }
        // Always add company security filter for updates
        updateQuery.eq('company_id', projectCompanyId);
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
        deleteQuery.eq('company_id', projectCompanyId);
        result = await deleteQuery;
        break;

      default:
        throw new Error(`Unsupported operation: ${operationPlan.operation}`);
    }

    if (result.error) {
      console.error('Database operation error:', result.error);
      console.error('Error details:', JSON.stringify(result.error));
      throw new Error(`Database operation failed: ${result.error.message}`);
    }

    console.log('Database operation successful, records affected:', result.data?.length || 0);

    // Log the successful operation with strict project context
    await supabase.from('ai_chat_interactions').insert({
      user_id: user.id,
      company_id: projectCompanyId,
      project_id: projectId,
      command_text: prompt,
      response_summary: `Database operation for project "${projectData.name}": ${operationPlan.operation} on ${operationPlan.table}`,
      context_data: {
        operation: operationPlan.operation,
        table: operationPlan.table,
        recordsAffected: result.data?.length || 0,
        projectName: projectData.name,
        projectId: projectId,
        companyId: projectCompanyId
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
      error: (error as Error).message,
      details: 'Failed to process SkAi database operation request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});