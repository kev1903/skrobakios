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

async function extractContractDataWithOpenAI(fileId: string): Promise<ContractData> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Starting extractWithOpenAI with fileId:', fileId);

  const requestBody = {
    model: 'gpt-4o-mini',
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
            text: 'Extract all contract details from this document with special attention to payment structures and tables. Include: 1) Customer information (name, email, phone, address), 2) Contract value/amount, 3) Important dates (contract date, start date, end date), 4) Scope of work, 5) DETAILED PAYMENT INFORMATION including: - Stage payments (each stage with name, description, amount, percentage, due date), - Progress payments (milestones with percentages and amounts), - Payment tables and schedules with structured data, - Deposit amount and percentage, - Retention amounts and percentages, - Final payment details, - Payment methods, - Late payment penalties or terms. 6) PAYMENT TABLES: Extract any payment tables showing stages, percentages, amounts, descriptions, and work involved. Format these as structured arrays with consistent column headers. Extract ALL payment-related information and tables you can find.'
          },
          {
            type: 'file',
            file: {
              file_id: fileId
            }
          }
        ]
      }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'ContractExtraction',
        schema: {
          type: 'object',
          required: ['customer_name', 'ai_summary', 'ai_confidence'],
          additionalProperties: false,
          properties: {
            customer_name: { type: 'string' },
            customer_email: { type: 'string' },
            customer_phone: { type: 'string' },
            customer_address: { type: 'string' },
            contract_value: { type: 'string' },
            contract_date: { type: 'string' },
            start_date: { type: 'string' },
            end_date: { type: 'string' },
            scope_of_work: { type: 'string' },
            payment_terms: { type: 'string' },
            stage_payments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  description: { type: 'string' },
                  amount: { type: 'string' },
                  percentage: { type: 'string' },
                  due_date: { type: 'string' }
                }
              }
            },
            progress_payments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone: { type: 'string' },
                  percentage: { type: 'string' },
                  amount: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            payment_tables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  table_name: { type: 'string' },
                  columns: { 
                    type: 'array', 
                    items: { type: 'string' }
                  },
                  rows: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        stage_name: { type: 'string' },
                        description: { type: 'string' },
                        percentage: { type: 'string' },
                        amount: { type: 'string' },
                        work_involved: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            payment_schedule: { type: 'string' },
            deposit_amount: { type: 'string' },
            deposit_percentage: { type: 'string' },
            retention_amount: { type: 'string' },
            retention_percentage: { type: 'string' },
            final_payment: { type: 'string' },
            payment_method: { type: 'string' },
            late_payment_terms: { type: 'string' },
            ai_summary: { type: 'string' },
            ai_confidence: { type: 'number' }
          }
        },
        strict: false
      }
    },
    temperature: 0.1
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Response status:', response.status);

  const responseData = await response.json();
  console.log('Response body:', JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${responseData.error?.message || 'Unknown error'}`);
  }

  const extractedText = responseData.choices[0].message.content;
  console.log('Extracted text:', extractedText);

  return JSON.parse(extractedText);
}

async function uploadFileToOpenAI(fileContent: Uint8Array, fileName: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create form data for file upload
  const formData = new FormData();
  formData.append('file', new File([new Uint8Array(fileContent)], fileName, { type: 'application/pdf' }));
  formData.append('purpose', 'assistants');

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to upload file to OpenAI: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('File uploaded to OpenAI:', data.id);
  return data.id;
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

    // Upload to OpenAI
    const openAIFileId = await uploadFileToOpenAI(fileContent, fileName);

    // Extract contract data using OpenAI
    const contractData = await extractContractDataWithOpenAI(openAIFileId);

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