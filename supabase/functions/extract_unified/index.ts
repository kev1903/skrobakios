// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type UnifiedResult = {
  document_type: "contract" | "drawing" | "spec" | "invoice" | "other";
  ai_summary: string;
  ai_confidence: number; // 0..1
  contract?: {
    title?: string;
    parties?: string[];
    effective_date?: string;
    expiry_date?: string;
    contract_value?: string;
    payment_terms?: string;
    scope_of_work?: string;
    termination_clause?: string;
    special_conditions?: string;
  };
  drawing?: {
    drawing_number?: string;
    revision?: string;
    project_name?: string;
    client_name?: string;
    architect?: string;
    scale?: string;
    discipline?: string;
    drawing_type?: string;
  };
  invoice?: {
    invoice_number?: string;
    invoice_date?: string;
    due_date?: string;
    vendor?: string;
    client?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    line_items?: Array<{
      description: string;
      qty: number;
      rate: number;
      amount: number;
    }>;
  };
};

const UnifiedSchema = {
  name: "UnifiedDocumentExtraction",
  schema: {
    type: "object",
    properties: {
      document_type: {
        type: "string",
        enum: ["contract", "drawing", "spec", "invoice", "other"]
      },
      ai_summary: { type: "string" },
      ai_confidence: { type: "number", minimum: 0, maximum: 1 },
      contract: {
        type: "object",
        properties: {
          title: { type: "string" },
          parties: { type: "array", items: { type: "string" } },
          effective_date: { type: "string" },
          expiry_date: { type: "string" },
          contract_value: { type: "string" },
          payment_terms: { type: "string" },
          scope_of_work: { type: "string" },
          termination_clause: { type: "string" },
          special_conditions: { type: "string" }
        }
      },
      drawing: {
        type: "object",
        properties: {
          drawing_number: { type: "string" },
          revision: { type: "string" },
          project_name: { type: "string" },
          client_name: { type: "string" },
          architect: { type: "string" },
          scale: { type: "string" },
          discipline: { type: "string" },
          drawing_type: { type: "string" }
        }
      },
      invoice: {
        type: "object",
        properties: {
          invoice_number: { type: "string" },
          invoice_date: { type: "string" },
          due_date: { type: "string" },
          vendor: { type: "string" },
          client: { type: "string" },
          subtotal: { type: "number" },
          tax: { type: "number" },
          total: { type: "number" },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                qty: { type: "number" },
                rate: { type: "number" },
                amount: { type: "number" }
              }
            }
          }
        }
      }
    },
    required: ["document_type", "ai_summary", "ai_confidence"]
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using PDF.js
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    // Use PDF.js worker to extract text
    const pdfWorkerUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    
    // For Deno, we'll use a simpler approach with pdf-parse
    const pdfParse = await import("https://deno.land/x/pdf_parse@1.1.0/mod.ts");
    const data = await pdfParse.default(new Uint8Array(pdfBytes));
    return data.text || "";
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    // Fallback: try to extract basic text patterns if possible
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(pdfBytes);
    
    // Extract readable text between common PDF text markers
    const textMatches = text.match(/BT\s+.*?ET/gs);
    if (textMatches) {
      return textMatches.join(' ').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    return "Unable to extract text from PDF";
  }
}

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json();
    const { signed_url, file_url, project_contract_id } = body;

    console.log('Processing document extraction:', {
      file_url,
      signed_url,
      project_contract_id
    });

    // 1) Download file bytes (prefer signed_url if provided)
    const url = signed_url || file_url;
    const bytes = await fetchAsArrayBuffer(url);

    console.log('Downloaded file, size:', bytes.byteLength);

    // 2) Extract text from PDF
    const extractedText = await extractTextFromPDF(bytes);
    console.log('Extracted text length:', extractedText.length);

    // 3) Call OpenAI Chat Completions API with extracted text
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert document extraction engine for construction documents. " +
              "Analyze the provided text extracted from a PDF and extract structured data. " +
              "Focus on accuracy and only extract information that is clearly present in the text. " +
              "Return ONLY valid JSON matching the schema."
          },
          {
            role: "user",
            content: `Extract structured data from this construction document text:

${extractedText}

Please analyze this text and extract:
1. Document type (contract, drawing, invoice, spec, or other)
2. A summary of the document
3. Confidence level (0.0-1.0) based on text clarity and completeness
4. Relevant structured data based on document type

Return only the JSON matching the schema.`
          }
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: UnifiedSchema 
        },
        max_tokens: 2000
      })
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      console.error('OpenAI Chat Completions API failed:', completion.status, errorText);
      return new Response(errorText, { 
        status: completion.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const completionData = await completion.json();
    console.log('OpenAI API response received');
    
    const messageContent = completionData?.choices?.[0]?.message?.content;
    
    if (!messageContent) {
      throw new Error("No structured output from model");
    }

    const data = JSON.parse(messageContent) as UnifiedResult;

    console.log('AI extraction complete:', { 
      document_type: data.document_type, 
      confidence: data.ai_confidence, 
      summary_length: data.ai_summary?.length || 0 
    });

    // 4) Update the project_contracts table with the extracted data
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const updateData: any = {
      ai_summary_json: data.ai_summary,
      confidence: data.ai_confidence,
      contract_data: data,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('project_contracts')
      .update(updateData)
      .eq('id', project_contract_id);

    if (updateError) {
      console.error('Failed to update project_contracts:', updateError);
      throw updateError;
    }

    console.log('Updated project_contracts table for contract ID:', project_contract_id);

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in extract_unified function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});