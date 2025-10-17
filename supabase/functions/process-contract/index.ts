import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractData {
  // === PARTIES ===
  parties: Array<{
    role: string; // e.g., "Client", "Owner", "Contractor", "Service Provider", "Principal"
    name: string;
    abn_acn?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    contact_person?: string;
    authorized_representative?: string;
  }>;
  
  // === CONTRACT DETAILS ===
  contract_number?: string;
  contract_title?: string;
  contract_type?: string; // e.g., "Design Management", "Construction", "Services"
  contract_value: string;
  contract_value_ex_gst?: string;
  contract_value_inc_gst?: string;
  gst_amount?: string;
  contract_date?: string;
  execution_date?: string;
  commencement_date?: string;
  start_date?: string;
  end_date?: string;
  completion_date?: string;
  duration?: string; // e.g., "12 weeks", "6 months"
  
  // === SCOPE & DELIVERABLES ===
  scope_of_work?: string;
  project_description?: string;
  site_address?: string;
  deliverables?: Array<{
    item: string;
    description?: string;
    due_date?: string;
    status?: string;
  }>;
  exclusions?: string[];
  inclusions?: string[];
  specifications?: string[];
  
  // === PAYMENT STRUCTURE ===
  payment_terms?: string;
  payment_schedule?: Array<{
    sequence: number;
    stage_name: string;
    description: string;
    percentage?: string;
    amount: string;
    amount_ex_gst?: string;
    amount_inc_gst?: string;
    trigger?: string; // What triggers this payment
    due_date?: string;
    due_days?: number; // Days after trigger/invoice
    status?: string;
  }>;
  stage_payments?: Array<{
    stage: string;
    description: string;
    amount: string;
    percentage?: string;
    due_date?: string;
    work_included?: string[];
  }>;
  progress_payments?: Array<{
    milestone: string;
    percentage: string;
    amount: string;
    description?: string;
  }>;
  payment_tables?: Array<{
    table_name: string;
    columns: string[];
    rows: any[][];
  }>;
  deposit_amount?: string;
  deposit_percentage?: string;
  retention_amount?: string;
  retention_percentage?: string;
  retention_terms?: string;
  final_payment?: string;
  final_payment_trigger?: string;
  payment_method?: string;
  payment_due_days?: number;
  late_payment_terms?: string;
  late_payment_interest_rate?: string;
  
  // === VARIATIONS & CHANGES ===
  variations_clause?: string;
  variation_process?: string;
  change_order_process?: string;
  
  // === TIMELINE & MILESTONES ===
  key_milestones?: Array<{
    milestone: string;
    date?: string;
    description?: string;
  }>;
  critical_dates?: Array<{
    event: string;
    date: string;
  }>;
  time_extension_clause?: string;
  
  // === LEGAL & COMPLIANCE ===
  insurance_requirements?: Array<{
    type: string; // e.g., "Public Liability", "Professional Indemnity"
    amount?: string;
    provider?: string;
    expiry?: string;
  }>;
  warranties?: Array<{
    type: string;
    duration?: string;
    terms?: string;
  }>;
  guarantees?: string[];
  liquidated_damages?: {
    amount?: string;
    rate?: string;
    trigger?: string;
  };
  
  // === TERMINATION & DISPUTES ===
  termination_clause?: string;
  termination_notice_period?: string;
  termination_by_client?: string;
  termination_by_contractor?: string;
  dispute_resolution?: string;
  governing_law?: string;
  jurisdiction?: string;
  
  // === RISKS & OBLIGATIONS ===
  contractor_obligations?: string[];
  client_obligations?: string[];
  risk_allocation?: string;
  indemnities?: string[];
  
  // === STANDARDS & COMPLIANCE ===
  applicable_standards?: string[];
  building_codes?: string[];
  permits_required?: string[];
  approvals_required?: string[];
  
  // === ADDITIONAL TERMS ===
  confidentiality?: string;
  intellectual_property?: string;
  subcontracting?: string;
  assignment_clause?: string;
  notices_clause?: string;
  force_majeure?: string;
  
  // === EXTRACTED TABLES & SCHEDULES ===
  schedules?: Array<{
    schedule_name: string;
    schedule_number?: string;
    content: any;
  }>;
  
  // === META ===
  contract_pages?: number;
  appendices?: string[];
  attachments?: string[];
  special_conditions?: string[];
  general_conditions_reference?: string;
  
  // === AI ANALYSIS ===
  ai_summary: string;
  ai_confidence: number;
  key_risks?: string[];
  key_opportunities?: string[];
  attention_required?: string[];
  missing_information?: string[];
  unusual_terms?: string[];
}

function convertPDFToBase64(fileContent: Uint8Array): string {
  console.log('[PDF CONVERSION] Converting PDF to base64 using Deno standard library...');
  console.log('[PDF CONVERSION] PDF size:', fileContent.length, 'bytes');
  
  // Use Deno's standard library base64 encoding
  const base64 = base64Encode(fileContent);
  
  console.log('[PDF CONVERSION] Base64 conversion complete, length:', base64.length);
  return base64;
}

async function extractContractDataWithLovableAI(pdfBase64: string): Promise<ContractData> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('Lovable API key not configured');
  }

  console.log('Starting visual analysis with Lovable AI Gemini (SkAI)');

  const systemPrompt = `You are SkAI, an elite AI contract analyst with deep expertise in construction, project management, and legal contracts. 
Your mission is to perform EXHAUSTIVE visual analysis of contract documents, extracting EVERY piece of information that could be valuable for project execution, planning, risk management, and compliance.

CRITICAL INSTRUCTIONS:
1. EXTRACT EVERYTHING - Leave no stone unturned. Capture all parties, dates, amounts, terms, conditions, schedules, and clauses.
2. BE ADAPTIVE - Different contracts have different structures. Adapt your extraction to match what you see in the document.
3. VISUAL ANALYSIS - Pay close attention to tables, layouts, headers, formatting, logos, signatures, and visual structure.
4. IDENTIFY ALL PARTIES - Extract ALL parties mentioned: clients, owners, contractors, service providers, consultants, etc.
5. CAPTURE ALL FINANCIALS - Every payment, every percentage, every trigger, every condition.
6. TIMELINE EVERYTHING - Capture all dates, milestones, deadlines, and time-related conditions.
7. RISK AWARENESS - Identify risks, unusual terms, missing information, and areas requiring attention.
8. SMART CONTRACT CONVERSION - Your extraction will power a smart contract system. Be thorough and precise.

Return ONLY valid JSON with no additional text or formatting.`;

  const userPrompt = `Perform EXHAUSTIVE visual analysis of this contract PDF. Extract EVERY detail that could be valuable for project execution, planning, and risk management.

CRITICAL AREAS TO ANALYZE:

1. PARTIES (ALL of them):
   - Identify EVERY party: clients, owners, contractors, service providers, consultants
   - Extract names, ABN/ACN, contact details, addresses, authorized representatives
   - Look for letterheads, signatures, contact blocks

2. CONTRACT FUNDAMENTALS:
   - Contract number, title, type
   - All dates: contract date, execution, commencement, start, end, completion
   - Total value, GST breakdown, payment terms

3. SCOPE & DELIVERABLES:
   - Detailed scope of work
   - Every deliverable with due dates
   - Site/project address
   - Inclusions and exclusions
   - Specifications and standards

4. PAYMENT STRUCTURE (COMPREHENSIVE):
   - Extract COMPLETE payment schedule with:
     * Sequence/stage number
     * Stage name and description
     * Amount (ex/inc GST)
     * Percentage of total
     * Payment trigger (what makes it due)
     * Due date or days after trigger
   - Deposit details
   - Progress/milestone payments
   - Retention amounts and release conditions
   - Final payment triggers
   - Late payment terms and interest rates
   - Payment method requirements

5. TIMELINES & MILESTONES:
   - Key milestones with dates
   - Critical dates and deadlines
   - Duration and time extension clauses

6. LEGAL & COMPLIANCE:
   - Insurance requirements (types, amounts, expiry)
   - Warranties and guarantees
   - Liquidated damages clauses
   - Standards and building codes
   - Required permits and approvals

7. VARIATIONS & CHANGES:
   - Change order process
   - Variation clauses
   - How changes are approved and priced

8. TERMINATION & DISPUTES:
   - Termination clauses (by both parties)
   - Notice periods
   - Dispute resolution process
   - Governing law and jurisdiction

9. OBLIGATIONS & RISKS:
   - Contractor obligations
   - Client obligations
   - Risk allocation
   - Indemnities

10. SPECIAL CONDITIONS:
    - Any unusual or special terms
    - Confidentiality clauses
    - IP ownership
    - Subcontracting rules
    - Force majeure

11. SCHEDULES & ATTACHMENTS:
    - Extract content from all schedules
    - List appendices and attachments

12. AI ANALYSIS:
    - Provide insightful summary
    - Identify key risks
    - Flag unusual terms
    - Note missing information
    - Highlight attention areas

Return a comprehensive JSON object matching this structure:

{
  "parties": [
    {
      "role": "string (Client/Owner/Contractor/Service Provider)",
      "name": "string",
      "abn_acn": "string or null",
      "email": "string or null",
      "phone": "string or null",
      "mobile": "string or null",
      "address": "string or null",
      "contact_person": "string or null",
      "authorized_representative": "string or null"
    }
  ],
  "contract_number": "string or null",
  "contract_title": "string or null",
  "contract_type": "string or null",
  "contract_value": "string (REQUIRED)",
  "contract_value_ex_gst": "string or null",
  "contract_value_inc_gst": "string or null",
  "gst_amount": "string or null",
  "contract_date": "string or null",
  "execution_date": "string or null",
  "commencement_date": "string or null",
  "start_date": "string or null",
  "end_date": "string or null",
  "completion_date": "string or null",
  "duration": "string or null",
  "scope_of_work": "string or null",
  "project_description": "string or null",
  "site_address": "string or null",
  "deliverables": [
    {
      "item": "string",
      "description": "string or null",
      "due_date": "string or null",
      "status": "string or null"
    }
  ],
  "exclusions": ["string"],
  "inclusions": ["string"],
  "specifications": ["string"],
  "payment_terms": "string or null",
  "payment_schedule": [
    {
      "sequence": number,
      "stage_name": "string",
      "description": "string",
      "percentage": "string or null",
      "amount": "string",
      "amount_ex_gst": "string or null",
      "amount_inc_gst": "string or null",
      "trigger": "string or null",
      "due_date": "string or null",
      "due_days": number or null,
      "status": "string or null"
    }
  ],
  "stage_payments": [
    {
      "stage": "string",
      "description": "string",
      "amount": "string",
      "percentage": "string or null",
      "due_date": "string or null",
      "work_included": ["string"]
    }
  ],
  "progress_payments": [
    {
      "milestone": "string",
      "percentage": "string",
      "amount": "string",
      "description": "string or null"
    }
  ],
  "payment_tables": [
    {
      "table_name": "string",
      "columns": ["string"],
      "rows": [["any"]]
    }
  ],
  "deposit_amount": "string or null",
  "deposit_percentage": "string or null",
  "retention_amount": "string or null",
  "retention_percentage": "string or null",
  "retention_terms": "string or null",
  "final_payment": "string or null",
  "final_payment_trigger": "string or null",
  "payment_method": "string or null",
  "payment_due_days": number or null,
  "late_payment_terms": "string or null",
  "late_payment_interest_rate": "string or null",
  "variations_clause": "string or null",
  "variation_process": "string or null",
  "change_order_process": "string or null",
  "key_milestones": [
    {
      "milestone": "string",
      "date": "string or null",
      "description": "string or null"
    }
  ],
  "critical_dates": [
    {
      "event": "string",
      "date": "string"
    }
  ],
  "time_extension_clause": "string or null",
  "insurance_requirements": [
    {
      "type": "string",
      "amount": "string or null",
      "provider": "string or null",
      "expiry": "string or null"
    }
  ],
  "warranties": [
    {
      "type": "string",
      "duration": "string or null",
      "terms": "string or null"
    }
  ],
  "guarantees": ["string"],
  "liquidated_damages": {
    "amount": "string or null",
    "rate": "string or null",
    "trigger": "string or null"
  },
  "termination_clause": "string or null",
  "termination_notice_period": "string or null",
  "termination_by_client": "string or null",
  "termination_by_contractor": "string or null",
  "dispute_resolution": "string or null",
  "governing_law": "string or null",
  "jurisdiction": "string or null",
  "contractor_obligations": ["string"],
  "client_obligations": ["string"],
  "risk_allocation": "string or null",
  "indemnities": ["string"],
  "applicable_standards": ["string"],
  "building_codes": ["string"],
  "permits_required": ["string"],
  "approvals_required": ["string"],
  "confidentiality": "string or null",
  "intellectual_property": "string or null",
  "subcontracting": "string or null",
  "assignment_clause": "string or null",
  "notices_clause": "string or null",
  "force_majeure": "string or null",
  "schedules": [
    {
      "schedule_name": "string",
      "schedule_number": "string or null",
      "content": "any"
    }
  ],
  "contract_pages": number or null,
  "appendices": ["string"],
  "attachments": ["string"],
  "special_conditions": ["string"],
  "general_conditions_reference": "string or null",
  "ai_summary": "string (REQUIRED - comprehensive summary)",
  "ai_confidence": number (0-100, REQUIRED),
  "key_risks": ["string"],
  "key_opportunities": ["string"],
  "attention_required": ["string"],
  "missing_information": ["string"],
  "unusual_terms": ["string"]
}

REMEMBER: Extract EVERYTHING visible in the document. This is a Smart Contract conversion - completeness is critical.`;

  // Use Gemini's PDF document support with correct file format
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { 
          role: 'system', 
          content: systemPrompt 
        },
        { 
          role: 'user', 
          content: [
            {
              type: 'text',
              text: userPrompt
            },
            {
              type: 'file',
              file: {
                filename: 'contract.pdf',
                file_data: `data:application/pdf;base64,${pdfBase64}`
              }
            }
          ]
        }
      ]
    }),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Lovable AI error:', errorData);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
    }
    throw new Error(`Lovable AI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const responseData = await response.json();
  console.log('AI Response received');

  const extractedContent = responseData.choices[0].message.content;
  console.log('Extracted content:', extractedContent);

  // Parse JSON from the response
  const jsonMatch = extractedContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  
  // Ensure required fields have defaults
  return {
    parties: parsed.parties || [],
    contract_number: parsed.contract_number || undefined,
    contract_title: parsed.contract_title || undefined,
    contract_type: parsed.contract_type || undefined,
    contract_value: parsed.contract_value || '0',
    contract_value_ex_gst: parsed.contract_value_ex_gst || undefined,
    contract_value_inc_gst: parsed.contract_value_inc_gst || undefined,
    gst_amount: parsed.gst_amount || undefined,
    contract_date: parsed.contract_date || undefined,
    execution_date: parsed.execution_date || undefined,
    commencement_date: parsed.commencement_date || undefined,
    start_date: parsed.start_date || undefined,
    end_date: parsed.end_date || undefined,
    completion_date: parsed.completion_date || undefined,
    duration: parsed.duration || undefined,
    scope_of_work: parsed.scope_of_work || undefined,
    project_description: parsed.project_description || undefined,
    site_address: parsed.site_address || undefined,
    deliverables: parsed.deliverables || [],
    exclusions: parsed.exclusions || [],
    inclusions: parsed.inclusions || [],
    specifications: parsed.specifications || [],
    payment_terms: parsed.payment_terms || undefined,
    payment_schedule: parsed.payment_schedule || [],
    stage_payments: parsed.stage_payments || [],
    progress_payments: parsed.progress_payments || [],
    payment_tables: parsed.payment_tables || [],
    deposit_amount: parsed.deposit_amount || undefined,
    deposit_percentage: parsed.deposit_percentage || undefined,
    retention_amount: parsed.retention_amount || undefined,
    retention_percentage: parsed.retention_percentage || undefined,
    retention_terms: parsed.retention_terms || undefined,
    final_payment: parsed.final_payment || undefined,
    final_payment_trigger: parsed.final_payment_trigger || undefined,
    payment_method: parsed.payment_method || undefined,
    payment_due_days: parsed.payment_due_days || undefined,
    late_payment_terms: parsed.late_payment_terms || undefined,
    late_payment_interest_rate: parsed.late_payment_interest_rate || undefined,
    variations_clause: parsed.variations_clause || undefined,
    variation_process: parsed.variation_process || undefined,
    change_order_process: parsed.change_order_process || undefined,
    key_milestones: parsed.key_milestones || [],
    critical_dates: parsed.critical_dates || [],
    time_extension_clause: parsed.time_extension_clause || undefined,
    insurance_requirements: parsed.insurance_requirements || [],
    warranties: parsed.warranties || [],
    guarantees: parsed.guarantees || [],
    liquidated_damages: parsed.liquidated_damages || undefined,
    termination_clause: parsed.termination_clause || undefined,
    termination_notice_period: parsed.termination_notice_period || undefined,
    termination_by_client: parsed.termination_by_client || undefined,
    termination_by_contractor: parsed.termination_by_contractor || undefined,
    dispute_resolution: parsed.dispute_resolution || undefined,
    governing_law: parsed.governing_law || undefined,
    jurisdiction: parsed.jurisdiction || undefined,
    contractor_obligations: parsed.contractor_obligations || [],
    client_obligations: parsed.client_obligations || [],
    risk_allocation: parsed.risk_allocation || undefined,
    indemnities: parsed.indemnities || [],
    applicable_standards: parsed.applicable_standards || [],
    building_codes: parsed.building_codes || [],
    permits_required: parsed.permits_required || [],
    approvals_required: parsed.approvals_required || [],
    confidentiality: parsed.confidentiality || undefined,
    intellectual_property: parsed.intellectual_property || undefined,
    subcontracting: parsed.subcontracting || undefined,
    assignment_clause: parsed.assignment_clause || undefined,
    notices_clause: parsed.notices_clause || undefined,
    force_majeure: parsed.force_majeure || undefined,
    schedules: parsed.schedules || [],
    contract_pages: parsed.contract_pages || undefined,
    appendices: parsed.appendices || [],
    attachments: parsed.attachments || [],
    special_conditions: parsed.special_conditions || [],
    general_conditions_reference: parsed.general_conditions_reference || undefined,
    ai_summary: parsed.ai_summary || 'Contract processed successfully',
    ai_confidence: parsed.ai_confidence || 85,
    key_risks: parsed.key_risks || [],
    key_opportunities: parsed.key_opportunities || [],
    attention_required: parsed.attention_required || [],
    missing_information: parsed.missing_information || [],
    unusual_terms: parsed.unusual_terms || []
  };
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileUrl, fileName, projectId, name, description, extractOnly } = await req.json();

    if (!fileUrl || !fileName || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: fileUrl, fileName, projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('===== PROCESS CONTRACT v5.0 START (SkAI Enhanced Smart Analysis) =====');
    console.log('Processing contract:', { fileUrl, fileName, projectId, name });

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileContent = new Uint8Array(await fileResponse.arrayBuffer());
    console.log('Downloaded file, size:', fileContent.length);

    // Convert PDF to base64 for visual analysis
    console.log('[STEP 1/2] Converting PDF to base64 for SkAI visual analysis...');
    const pdfBase64 = convertPDFToBase64(fileContent);
    console.log('[STEP 1/2] PDF conversion complete.');
    
    // Visual analysis using Lovable AI Gemini (SkAI)
    console.log('[STEP 2/2] SkAI performing visual analysis of contract...');
    const contractData = await extractContractDataWithLovableAI(pdfBase64);
    console.log('[STEP 2/2] SkAI visual analysis complete.');
    console.log('===== PROCESS CONTRACT v5.0 SUCCESS =====');

    // If extractOnly is true, just return the data without saving
    if (extractOnly) {
      console.log('Extract only mode - returning contract data');
      return new Response(
        JSON.stringify({ 
          success: true, 
          contractData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in database
    const { data: contract, error: dbError } = await supabaseClient
      .from('project_contracts')
      .insert({
        project_id: projectId,
        name: name || fileName,
        description: description || contractData.ai_summary,
        file_url: fileUrl,
        file_path: `contracts/${fileName}`,
        file_size: fileContent.length,
        contract_data: contractData,
        confidence: contractData.ai_confidence,
        status: 'active',
        extracted_text: JSON.stringify(contractData)
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save contract: ${dbError.message}`);
    }

    console.log('Contract processed successfully:', contract.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contract,
        contractData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing contract:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});