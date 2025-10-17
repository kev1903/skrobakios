import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractData {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  contract_value: string;
  contract_date?: string;
  start_date?: string;
  end_date?: string;
  scope_of_work?: string;
  payment_terms?: string;
  stage_payments?: Array<{
    stage: string;
    description: string;
    amount: string;
    percentage?: string;
    due_date?: string;
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
    rows: Array<{
      stage_name: string;
      description: string;
      percentage: string;
      amount: string;
      work_involved?: string;
    }>;
  }>;
  payment_schedule?: string;
  deposit_amount?: string;
  deposit_percentage?: string;
  retention_amount?: string;
  retention_percentage?: string;
  final_payment?: string;
  payment_method?: string;
  late_payment_terms?: string;
  ai_summary: string;
  ai_confidence: number;
}

async function extractContractDataWithLovableAI(fileContent: Uint8Array): Promise<ContractData> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('Lovable API key not configured');
  }

  console.log('Starting extraction with Lovable AI Gemini');

  // Convert PDF to base64
  const base64Content = btoa(String.fromCharCode(...fileContent));

  const requestBody = {
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at extracting contract data from PDFs with special focus on payment structures. Extract all relevant contract information including customer details, contract value, dates, terms, and DETAILED payment information including stage payments, progress payments, deposit terms, retention amounts, and payment schedules. Return valid JSON only.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all contract details from this document with special attention to payment structures and tables. Include: 1) Customer information (name, email, phone, address), 2) Contract value/amount, 3) Important dates (contract date, start date, end date), 4) Scope of work, 5) DETAILED PAYMENT INFORMATION including: - Stage payments (each stage with name, description, amount, percentage, due date), - Progress payments (milestones with percentages and amounts), - Payment tables and schedules with structured data, - Deposit amount and percentage, - Retention amounts and percentages, - Final payment details, - Payment methods, - Late payment penalties or terms. 6) PAYMENT TABLES: Extract any payment tables showing stages, percentages, amounts, descriptions, and work involved. Format these as structured arrays with consistent column headers. Extract ALL payment-related information and tables you can find. Return ONLY valid JSON matching this structure: {"customer_name": string, "customer_email": string, "customer_phone": string, "customer_address": string, "contract_value": string, "contract_date": string, "start_date": string, "end_date": string, "scope_of_work": string, "payment_terms": string, "stage_payments": array, "progress_payments": array, "payment_tables": array, "payment_schedule": string, "deposit_amount": string, "deposit_percentage": string, "retention_amount": string, "retention_percentage": string, "final_payment": string, "payment_method": string, "late_payment_terms": string, "ai_summary": string, "ai_confidence": number}'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${base64Content}`
            }
          }
        ]
      }
    ]
  };

  console.log('Sending request to Lovable AI Gateway');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Response status:', response.status);

  const responseData = await response.json();
  console.log('Response body:', JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
    }
    throw new Error(`Lovable AI API error: ${responseData.error?.message || 'Unknown error'}`);
  }

  const extractedText = responseData.choices[0].message.content;
  console.log('Extracted text:', extractedText);

  // Parse JSON from the response
  const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
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

    console.log('Processing contract:', { fileUrl, fileName, projectId, name });

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileContent = new Uint8Array(await fileResponse.arrayBuffer());
    console.log('Downloaded file, size:', fileContent.length);

    // Extract contract data using Lovable AI Gemini
    const contractData = await extractContractDataWithLovableAI(fileContent);

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