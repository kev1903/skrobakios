import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest, ProcessInvoiceRequest } from "./schemas.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('process-invoice edge function loaded');

// Invoice extraction schema for structured output
const InvoiceSchema = {
  name: "extract_invoice_data",
  description: "Extract structured invoice/bill data from text and intelligently assign to project and WBS activity",
  parameters: {
    type: "object",
    properties: {
      supplier: { type: "string", description: "Supplier/vendor company name (e.g., 'The Urban Leaf Pty Ltd')" },
      supplier_email: { type: "string", description: "Supplier email address" },
      invoice_number: { type: "string", description: "Invoice or bill number (e.g., 'TUL3801')" },
      reference_number: { type: "string", description: "Purchase order or reference number" },
      invoice_date: { type: "string", description: "Invoice date in YYYY-MM-DD format" },
      due_date: { type: "string", description: "Payment due date in YYYY-MM-DD format" },
      subtotal: { type: "string", description: "Subtotal amount before tax (numeric value)" },
      tax: { type: "string", description: "Tax/GST amount (numeric value)" },
      total: { type: "string", description: "Total amount including tax (numeric value)" },
      project_id: { type: "string", description: "CRITICAL: Return the exact UUID string from the 'UUID:' field in the available projects list. Example: 'f8b3c4d5-1234-5678-90ab-cdef12345678'. Never return project code, name, or null - always return the UUID if any match exists." },
      wbs_activity_id: { type: "string", description: "CRITICAL: Return the exact UUID string from the 'UUID:' field in the available WBS activities list. Example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab'. Never return WBS code, title, or null - always return the UUID if any match exists." },
      project_match_reason: { type: "string", description: "Brief explanation of which keywords matched and why this project UUID was selected" },
      wbs_match_reason: { type: "string", description: "Brief explanation of which keywords matched and why this WBS activity UUID was selected" },
      line_items: {
        type: "array",
        description: "Individual line items from the invoice",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            qty: { type: "string" },
            rate: { type: "string" },
            amount: { type: "string" }
          },
          required: ["description", "amount"]
        }
      },
      ai_summary: { type: "string", description: "Brief 2-3 sentence summary of the invoice" },
      ai_confidence: { type: "number", description: "Confidence score from 0 to 1 (0.9+ for clear invoices)", minimum: 0, maximum: 1 }
    },
    required: ["supplier", "invoice_number", "total", "ai_summary", "ai_confidence"]
  }
};

// Convert file to base64 for AI processing (works for both PDFs and images)
function fileToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192; // Process in chunks to avoid string length limits
  
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.byteLength));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}


// Detect file type from filename
function getFileType(filename: string): 'pdf' | 'image' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image';
  return 'unknown';
}

// Get MIME type from filename
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'pdf': 'application/pdf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    // Use SUPABASE_ANON_KEY or fallback to apikey header
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 
      req.headers.get('apikey') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw';
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // SECURITY: Get auth token from request to respect RLS and company isolation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Parse and validate request body
    console.log('=== Parsing and validating request ===');
    
    let body;
    try {
      const text = await req.text();
      console.log('Request body length:', text.length);
      
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Request body is empty' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validation = validateRequest(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ ok: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { signed_url, filename, filesize, storage_path }: ProcessInvoiceRequest = validation.data!;
    const company_id = (body as any).company_id; // Optional company_id for project/WBS context

    console.log('=== Processing invoice ===');
    console.log('Filename:', filename);
    console.log('Filesize:', filesize);
    console.log('Company ID:', company_id);

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '');

    // SECURITY: Create authenticated Supabase client for user verification
    // Use a separate client instance for auth verification
    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    
    // Verify user is authenticated and has access to the company
    const { data: { user }, error: userError } = await authClient.auth.getUser(jwt);
    
    // Now create the main client with RLS headers for database operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    if (userError || !user) {
      console.error("Authentication failed:", userError);
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} authenticated for invoice processing`);

    // Validate user has access to the company if company_id is provided
    if (company_id) {
      const { data: membership, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('company_id', company_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError || !membership) {
        console.error(`User ${user.id} does not have access to company ${company_id}`);
        return new Response(
          JSON.stringify({ ok: false, error: "Access denied to this company" }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`User ${user.id} verified for company ${company_id}`);
    }

    // Fetch available projects and WBS items for context (RLS automatically filters by company)
    let projectsContext = '';
    let wbsContext = '';
    
    if (company_id) {
      try {
        console.log('=== Fetching projects and WBS context (RLS filtered) ===');
        
        // Fetch projects using authenticated client (RLS applies)
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id,name,project_id')
          .eq('company_id', company_id);
        
        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else if (projects && projects.length > 0) {
          console.log('=== PROJECTS CONTEXT FOR AI ===');
          console.log('Number of projects:', projects.length);
          projects.forEach((p: any) => {
            console.log(`Project: ${p.name} | UUID: ${p.id} | Code: ${p.project_id}`);
          });
          
          // Limit projects to reduce payload size
          const limitedProjects = projects.slice(0, 15);
          
          projectsContext = '\n\n=== AVAILABLE PROJECTS TO MATCH ===\n' + 
            'CRITICAL: You MUST return the exact UUID from below. DO NOT generate fake placeholder UUIDs!\n' +
            'Look for ANY keywords from these project names in the invoice content (partial matches are OK):\n\n' +
            limitedProjects.map((p: any) => 
              `PROJECT:\n` +
              `  UUID (RETURN THIS EXACT STRING): ${p.id}\n` +
              `  Project Code: ${p.project_id}\n` +
              `  Project Name: ${p.name}\n` +
              `  Keywords to search: ${p.name.toLowerCase()}, ${p.project_id.toLowerCase()}\n`
            ).join('\n');
          console.log(`Found ${projects.length} projects for context (showing first ${limitedProjects.length} for payload size optimization, RLS filtered)`);
        }
        
        // Fetch WBS items with project associations using authenticated client (RLS applies)
        const { data: wbsItems, error: wbsError } = await supabase
          .from('wbs_items')
          .select('id,wbs_id,title,description,category,project_id')
          .eq('company_id', company_id);
        
        if (wbsError) {
          console.error('Error fetching WBS items:', wbsError);
        } else if (wbsItems && wbsItems.length > 0) {
          console.log('=== WBS ACTIVITIES CONTEXT FOR AI ===');
          console.log('Number of WBS activities:', wbsItems.length);
          wbsItems.slice(0, 5).forEach((w: any) => {
            console.log(`WBS: ${w.title} | UUID: ${w.id} | Code: ${w.wbs_id} | Project: ${w.project_id}`);
          });
          
          // Limit WBS context to reduce payload size
          const limitedWbsItems = wbsItems.slice(0, 15);
          wbsContext = '\n\n=== AVAILABLE WBS ACTIVITIES TO MATCH ===\n' + 
            'CRITICAL: You MUST return the exact WBS UUID from below. DO NOT generate fake placeholder UUIDs!\n' +
            'IMPORTANT: Only assign WBS activities that belong to the SAME project you matched above.\n' +
            'Look for keywords in the invoice line items, descriptions, or notes that match these WBS activities:\n\n' +
            limitedWbsItems.map((w: any) => 
              `WBS ACTIVITY:\n` +
              `  UUID (RETURN THIS EXACT STRING): ${w.id}\n` +
              `  WBS Code: ${w.wbs_id}\n` +
              `  Title: ${w.title}\n` +
              `  Category: ${w.category || 'N/A'}\n` +
              `  Belongs to Project ID: ${w.project_id}\n` +
              `  Keywords: ${w.title.toLowerCase()}, ${w.wbs_id.toLowerCase()}${w.description ? ', ' + w.description.substring(0, 30).toLowerCase() : ''}\n`
            ).join('\n');
          console.log(`Found ${wbsItems.length} WBS items for context (showing first ${limitedWbsItems.length} for payload size optimization, RLS filtered)`);
        }
      } catch (contextError) {
        console.error('Error fetching context:', contextError);
        // Continue without context - not critical
      }
    }

    // Detect file type
    const fileType = getFileType(filename);
    console.log('=== FILE TYPE DETECTION ===');
    console.log('File type detected:', fileType);
    console.log('Filename extension:', filename.toLowerCase().split('.').pop());

    if (fileType === 'unknown') {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unsupported file type. Please upload PDF, JPG, JPEG, or PNG files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Download file
    console.log('=== DOWNLOADING FILE ===');
    console.log('Downloading file from storage...');
    const bytes = await fetchAsArrayBuffer(signed_url);
    console.log(`Downloaded ${bytes.byteLength} bytes`);

    // Check file size (max 3MB for memory optimization)
    const maxSize = 3 * 1024 * 1024; // Reduced from 5MB to 3MB
    if (bytes.byteLength > maxSize) {
      const sizeMB = (bytes.byteLength / 1024 / 1024).toFixed(2);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `File too large (${sizeMB}MB). Maximum is 3MB for processing.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Process file based on type (send ALL files as base64 to Gemini)
    console.log('=== DOCUMENT PROCESSING ===');
    console.log('Processing file type:', fileType);
    
    // For both PDFs and images: Convert to base64
    // Gemini 2.5 Pro natively supports PDF files, so we don't need to extract text
    console.log('Converting document to base64 for AI processing...');
    const base64Data = fileToBase64(bytes);
    const mimeType = fileType === 'pdf' ? 'application/pdf' : getMimeType(filename);
    
    // Validate base64 size (max ~4MB base64 for PDFs, ~3MB for images)
    const maxSizeKB = fileType === 'pdf' ? 4000 : 3000;
    const base64SizeKB = base64Data.length / 1024;
    
    if (base64SizeKB > maxSizeKB) {
      console.error('Base64 payload too large:', base64SizeKB, 'KB');
      return new Response(
        JSON.stringify({
          ok: false,
          error: `File produces a payload that is too large (${base64SizeKB.toFixed(0)}KB). Maximum allowed is ${maxSizeKB}KB. Please use a smaller or more compressed file.`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const documentContent = `DOCUMENT_BASE64:${mimeType}:${base64Data}`;
    console.log('Document conversion complete');
    console.log(`File type: ${fileType}, Size: ${(bytes.byteLength / 1024).toFixed(2)}KB, Base64 size: ${base64SizeKB.toFixed(2)}KB, MIME: ${mimeType}`);

    // Step 3: Send to AI for structured extraction
    console.log('=== SENDING TO AI FOR EXTRACTION ===');
    
    // Universal system prompt for both PDFs and images
    const systemPrompt = `You are SkAi, an expert invoice data extraction and intelligent project assignment system. Extract structured data from the invoice document and intelligently assign it to the most relevant project and WBS activity.

EXTRACTION RULES:
1. SUPPLIER: Full company name (look for "Pty Ltd", "LLC", "Inc", etc.)
2. INVOICE NUMBER: The invoice/bill reference number
3. DATES: Convert to YYYY-MM-DD format (e.g., "16 Sep 2025" → "2025-09-16")
4. AMOUNTS: Numeric values only for Total, Subtotal, Tax/GST
5. LINE ITEMS: Each item with description, quantity, rate, amount

PROJECT & WBS ASSIGNMENT - CRITICAL MATCHING RULES:

**STEP 1 - PROJECT MATCHING:**
- **CAREFULLY SCAN** the entire invoice for project names, keywords, or codes
- Look in: customer names, reference numbers, addresses, notes, line item descriptions, any text field
- **KEYWORD MATCHING**: Search for partial matches of project names (e.g., if project is "Skrobaki Construction", look for "Skrobaki" anywhere)
- **CUSTOMER NAME MATCHING**: If customer name matches project name, that's a strong match
- **FUZZY MATCHING**: Match even if only part of the project name appears (e.g., "Thanet Street" might match "5 Thanet Street Project")
- **ADDRESS MATCHING**: If invoice mentions an address, check if it matches any project address or name
- **CASE INSENSITIVE**: Ignore case differences (e.g., "skrobaki" matches "Skrobaki")
- If you find ANY keyword match, assign that project (don't require 70% confidence - even 40% is enough if there's a keyword match)
- Explain your reasoning clearly in the project_match_reason field

**STEP 2 - WBS ACTIVITY MATCHING (AFTER PROJECT IS MATCHED):**
- **CRITICAL**: Only select WBS activities that have "Belongs to Project ID" matching the project_id you selected in Step 1
- Look at invoice line items, descriptions, materials, work types to match WBS activities
- Match keywords: e.g., "landscaping" → WBS for landscaping work, "concrete" → WBS for concrete work
- **STRONG MATCH REQUIRED**: Only assign WBS if there's a clear match to the WBS title/description/category
- If no clear WBS match exists for the matched project, return null for wbs_activity_id
- Explain your reasoning clearly in the wbs_match_reason field

**CRITICAL UUID RETURN RULE:**
- ALWAYS return the exact UUID string from the list (e.g., "f8b3c4d5-1234-5678-90ab-cdef12345678")
- NEVER return the project code (like "SKROBAKI-PRJ-1") or project name (like "Skrobaki Project")
- NEVER return null if you found a keyword match - return the UUID from the "UUID:" field
- Copy the UUID EXACTLY as shown in the "UUID:" line of the matching project/WBS

MATCHING EXAMPLES WITH UUID RETURN:
- Invoice mentions "Skrobaki project" → Find project with "Skrobaki" in name → Return its UUID (not the code)
- Invoice mentions "5 Thanet Street" → Find project with "Thanet" in name → Return its UUID
- Invoice mentions "structural steel" → Find WBS activity about "structural" work → Return its UUID

Be precise with data extraction. Set high confidence (0.9+) only if all fields are clearly present.${projectsContext}${wbsContext}`;

    // Step 3: Build AI messages - send document as inline_data for Gemini
    const [_, mimeType, base64Data] = documentContent.split(':');
    
    const aiMessages: any[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all invoice data from this document including supplier, invoice number, dates, amounts, line items. Also intelligently assign to the most relevant project and WBS activity from the available lists.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
              detail: 'high'  // Use high detail for PDFs to ensure text is readable
            }
          }
        ]
      }
    ];
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: aiMessages,
        tools: [{
          type: 'function',
          function: InvoiceSchema
        }],
        tool_choice: { type: 'function', function: { name: 'extract_invoice_data' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ ok: false, error: 'AI credits required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI extraction complete');

    // Extract structured data from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('No structured output from AI');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    
    console.log('=== EXTRACTED INVOICE DATA ===');
    console.log('Supplier:', extractedData.supplier);
    console.log('Invoice #:', extractedData.invoice_number);
    console.log('Total:', extractedData.total);
    console.log('Project ID (UUID):', extractedData.project_id || 'Not assigned');
    console.log('Project Match Reason:', extractedData.project_match_reason || 'N/A');
    console.log('WBS Activity ID (UUID):', extractedData.wbs_activity_id || 'Not assigned');
    console.log('WBS Match Reason:', extractedData.wbs_match_reason || 'N/A');
    console.log('Confidence:', (extractedData.ai_confidence * 100).toFixed(0) + '%');

    return new Response(
      JSON.stringify({
        ok: true,
        data: extractedData,
        storage_path
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing invoice:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
