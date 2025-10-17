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

async function extractTextFromPDF(fileContent: Uint8Array): Promise<string> {
  try {
    // Convert Uint8Array to text
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let text = decoder.decode(fileContent);
    
    // Extract text content between stream markers
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let matches;
    let extractedText = '';
    
    while ((matches = streamRegex.exec(text)) !== null) {
      const streamContent = matches[1];
      // Try to extract readable text
      const readable = streamContent.replace(/[^\x20-\x7E\s]/g, '');
      if (readable.trim().length > 0) {
        extractedText += readable + ' ';
      }
    }
    
    // Also try to extract text from BT/ET markers (text objects)
    const textObjectRegex = /BT\s*([\s\S]*?)\s*ET/g;
    while ((matches = textObjectRegex.exec(text)) !== null) {
      const textContent = matches[1];
      // Extract text from Tj and TJ operators
      const tjRegex = /\((.*?)\)\s*T[jJ]/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(textContent)) !== null) {
        extractedText += tjMatch[1] + ' ';
      }
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .trim();
    
    if (extractedText.length < 50) {
      // Fallback: try to extract any printable text
      const fallbackText = text
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }
    
    console.log('Extracted text length:', extractedText.length);
    
    if (extractedText.length < 50) {
      throw new Error('Unable to extract sufficient text from PDF. The file may be image-based or encrypted.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the PDF contains extractable text.');
  }
}

async function extractContractDataWithLovableAI(pdfText: string): Promise<ContractData> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    throw new Error('Lovable API key not configured');
  }

  console.log('Starting extraction with Lovable AI Gemini');
  console.log('Text to analyze (first 500 chars):', pdfText.substring(0, 500));

  const systemPrompt = `You are an expert at extracting contract data from documents with special focus on payment structures. 
Extract all relevant contract information including customer details, contract value, dates, terms, and DETAILED payment information.
Return ONLY valid JSON with no additional text or formatting.`;

  const userPrompt = `Extract all contract details from this document text with special attention to payment structures and tables.

Document Text:
${pdfText}

Extract and return ONLY a JSON object with these fields:
{
  "customer_name": string (required),
  "customer_email": string or null,
  "customer_phone": string or null,
  "customer_address": string or null,
  "contract_value": string (total contract value),
  "contract_date": string or null,
  "start_date": string or null,
  "end_date": string or null,
  "scope_of_work": string or null,
  "payment_terms": string or null,
  "stage_payments": array of {stage, description, amount, percentage, due_date} or [],
  "progress_payments": array of {milestone, percentage, amount, description} or [],
  "payment_tables": array of {table_name, columns, rows} or [],
  "payment_schedule": string or null,
  "deposit_amount": string or null,
  "deposit_percentage": string or null,
  "retention_amount": string or null,
  "retention_percentage": string or null,
  "final_payment": string or null,
  "payment_method": string or null,
  "late_payment_terms": string or null,
  "ai_summary": string (brief summary of contract),
  "ai_confidence": number (0-100)
}`;

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
        { role: 'user', content: userPrompt }
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
    customer_name: parsed.customer_name || 'Unknown',
    customer_email: parsed.customer_email || undefined,
    customer_phone: parsed.customer_phone || undefined,
    customer_address: parsed.customer_address || undefined,
    contract_value: parsed.contract_value || '0',
    contract_date: parsed.contract_date || undefined,
    start_date: parsed.start_date || undefined,
    end_date: parsed.end_date || undefined,
    scope_of_work: parsed.scope_of_work || undefined,
    payment_terms: parsed.payment_terms || undefined,
    stage_payments: parsed.stage_payments || [],
    progress_payments: parsed.progress_payments || [],
    payment_tables: parsed.payment_tables || [],
    payment_schedule: parsed.payment_schedule || undefined,
    deposit_amount: parsed.deposit_amount || undefined,
    deposit_percentage: parsed.deposit_percentage || undefined,
    retention_amount: parsed.retention_amount || undefined,
    retention_percentage: parsed.retention_percentage || undefined,
    final_payment: parsed.final_payment || undefined,
    payment_method: parsed.payment_method || undefined,
    late_payment_terms: parsed.late_payment_terms || undefined,
    ai_summary: parsed.ai_summary || 'Contract processed successfully',
    ai_confidence: parsed.ai_confidence || 85
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

    console.log('Processing contract:', { fileUrl, fileName, projectId, name });

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileContent = new Uint8Array(await fileResponse.arrayBuffer());
    console.log('Downloaded file, size:', fileContent.length);

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const pdfText = await extractTextFromPDF(fileContent);
    
    // Extract contract data using Lovable AI Gemini
    console.log('Processing extracted text with Lovable AI Gemini...');
    const contractData = await extractContractDataWithLovableAI(pdfText);

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