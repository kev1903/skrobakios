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

// Enhanced PDF text extraction with fallback methods
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    // Method 1: Try PDF.js via CDN import
    try {
      const pdfjsLib = await import("https://esm.sh/pdfjs-dist@3.11.174");
      
      // Initialize worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(pdfBytes));
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      if (fullText.trim()) {
        console.log("PDF.js extraction successful");
        return cleanExtractedText(fullText);
      }
    } catch (pdfJsError) {
      console.warn("PDF.js extraction failed:", pdfJsError);
    }
    
    // Method 2: Fallback to manual text pattern extraction
    console.log("Using fallback text extraction method");
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(pdfBytes);
    
    // Enhanced pattern matching for PDF text extraction
    const patterns = [
      // Standard PDF text objects
      /BT\s+(.*?)\s+ET/gs,
      // Stream content
      /stream\s+(.*?)\s+endstream/gs,
      // Direct text patterns
      /\((.*?)\)/g,
      // Hex encoded text
      /<([0-9A-Fa-f\s]+)>/g
    ];
    
    let extractedText = '';
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Clean and decode the text
          let cleanMatch = match
            .replace(/BT\s+|ET|stream|endstream/g, '')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanMatch.length > 10) {
            extractedText += cleanMatch + ' ';
          }
        }
      }
    }
    
    return extractedText.trim() || "Unable to extract readable text from PDF";
    
  } catch (error) {
    console.error("All PDF text extraction methods failed:", error);
    return "PDF text extraction failed - document may be image-based or corrupted";
  }
}

// Clean and normalize extracted text
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove non-printable characters except newlines
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    // Clean up multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Clean up multiple newlines
    .replace(/\n+/g, '\n')
    // Trim whitespace
    .trim();
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
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert AI specialized in extracting structured data from construction industry documents including contracts, architectural drawings, specifications, and invoices. " +
              "You have deep knowledge of construction terminology, standard contract formats (AIA, FIDIC, NEC), architectural drawing conventions, and billing practices. " +
              "Analyze the provided text with high precision and extract only information that is explicitly present. " +
              "For confidence scoring: 0.9-1.0 = clear, complete information; 0.7-0.8 = good but some unclear areas; 0.5-0.6 = partial information; 0.3-0.4 = poor quality text; 0.0-0.2 = severely corrupted/unclear. " +
              "Return ONLY valid JSON matching the schema."
          },
          {
            role: "user",
            content: `Extract structured data from this construction document text:

${extractedText}

IMPORTANT INSTRUCTIONS:
1. Document Classification: Identify if this is a contract, architectural drawing, specification, invoice, or other document type
2. Data Extraction: Extract specific fields relevant to the document type:
   - CONTRACTS: Focus on parties, dates, values, payment terms, scope of work, special conditions
   - DRAWINGS: Look for drawing numbers, revisions, project info, discipline, scale, architect details
   - INVOICES: Extract numbers, dates, vendor/client info, line items, totals
   - SPECIFICATIONS: Identify section numbers, materials, standards, requirements
3. Quality Assessment: Set confidence based on text clarity and completeness
4. Summary: Provide a concise 2-3 sentence summary of the document's purpose and key details

Text quality indicators:
- High confidence: Clear formatting, complete sentences, standard terminology
- Medium confidence: Some formatting issues but readable content
- Low confidence: Fragmented text, missing sections, unclear content

Return only the JSON matching the schema.`
          }
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: UnifiedSchema 
        },
        max_tokens: 3000,
        temperature: 0.1
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

    // Validate extraction quality and retry if confidence is too low
    if (data.ai_confidence < 0.3) {
      console.warn('Low confidence extraction, attempting retry with enhanced prompt');
      
      // Retry with more specific prompt for low-quality extractions
      const retryCompletion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are analyzing a construction document with poor text extraction quality. " +
                "Focus on finding any readable fragments that indicate document type and key information. " +
                "Even with corrupted text, try to identify: document headers, company names, dates, numbers, and common construction terms. " +
                "Be conservative with confidence scoring for poor quality text."
            },
            {
              role: "user",
              content: `This text was extracted from a construction document but may be corrupted or incomplete:

${extractedText}

Please extract whatever information is readable, focusing on:
- Any document identifiers (contract numbers, drawing numbers, invoice numbers)
- Company or party names
- Dates in any format
- Monetary amounts
- Construction-related keywords

Set confidence appropriately for the text quality.`
            }
          ],
          response_format: { 
            type: "json_schema", 
            json_schema: UnifiedSchema 
          },
          max_tokens: 3000,
          temperature: 0.1
        })
      });

      if (retryCompletion.ok) {
        const retryData = await retryCompletion.json();
        const retryContent = retryData?.choices?.[0]?.message?.content;
        if (retryContent) {
          const retryResult = JSON.parse(retryContent) as UnifiedResult;
          console.log('Retry extraction completed');
          Object.assign(data, retryResult);
        }
      }
    }

    console.log('AI extraction complete:', { 
      document_type: data.document_type, 
      confidence: data.ai_confidence, 
      summary_length: data.ai_summary?.length || 0,
      extracted_text_length: extractedText.length
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