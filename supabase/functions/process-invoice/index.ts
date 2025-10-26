import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest, ProcessInvoiceRequest } from "./schemas.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('process-invoice edge function loaded');

// Invoice extraction schema for structured output
const InvoiceSchema = {
  name: "extract_invoice_data",
  description: "Extract structured invoice/bill data from text",
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

// Note: PDF text extraction removed - using vision model for direct PDF processing

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Parse and validate request body
    console.log('=== Parsing and validating request ===');
    const body = await req.json();
    
    const validation = validateRequest(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ ok: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { signed_url, filename, filesize, storage_path }: ProcessInvoiceRequest = validation.data!;

    console.log('=== Processing invoice ===');
    console.log('Filename:', filename);
    console.log('Filesize:', filesize);

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

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (bytes.byteLength > maxSize) {
      const sizeMB = (bytes.byteLength / 1024 / 1024).toFixed(2);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `File too large (${sizeMB}MB). Maximum is 5MB.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Process with vision model (works for both PDF and images)
    console.log('=== VISION MODEL PROCESSING ===');
    console.log(`Processing ${fileType === 'pdf' ? 'PDF' : 'image'} with vision AI...`);
    console.log('Converting to base64...');
    const base64Data = arrayBufferToBase64(bytes);
    const mimeType = getMimeType(filename);
    console.log('MIME type:', mimeType);
    console.log('Base64 length:', base64Data.length);

    // Use image_url format for both PDFs and images (works reliably with Gemini)
    const contentArray: any[] = [
      {
        type: 'text',
        text: `YOU MUST ANALYZE THE ACTUAL DOCUMENT PROVIDED BELOW. DO NOT USE PRIOR KNOWLEDGE OR CACHED DATA.

Read THIS SPECIFIC ${fileType === 'pdf' ? 'PDF document' : 'image'} carefully and extract the EXACT data visible in it:

REQUIRED FIELDS (extract exactly as shown):
1. SUPPLIER: The exact company name issuing this invoice (look for "Pty Ltd", "LLC", "Inc", etc.)
2. INVOICE NUMBER: The exact invoice/bill number printed on this document
3. INVOICE DATE: The exact invoice date (convert to YYYY-MM-DD format)
4. DUE DATE: The exact due date (convert to YYYY-MM-DD format)
5. TOTAL: The exact total amount (numeric value only)
6. SUBTOTAL: The exact subtotal before tax
7. TAX/GST: The exact tax amount
8. LINE ITEMS: Every line item with exact description, quantity, rate, and amount as printed

CRITICAL INSTRUCTIONS:
- Read ONLY from the document provided below
- Extract EXACT values - do not estimate or use similar data
- If a field is not visible, leave it empty - do not fabricate data
- Verify all numbers match what's printed in the document
- Set confidence to 0.95+ ONLY if all data is clearly visible and accurately extracted
- If anything is unclear, set confidence lower and note it in ai_summary

This is the actual document to analyze:`
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`,
          detail: 'high'
        }
      }
    ];

    const aiMessages = [
      {
        role: 'system',
        content: `You are a precise document data extraction system. Your ONLY job is to read the specific document provided and extract its exact data.

CRITICAL RULES:
1. ONLY extract data from the document shown to you - DO NOT use cached or prior knowledge
2. Extract EXACT values as they appear - no approximations or similar data from other documents
3. If a field is not visible in THIS document, leave it empty
4. Every number, date, and text must match what's printed in THIS specific document
5. Double-check that all extracted data corresponds to the actual document content

EXTRACTION REQUIREMENTS:
- SUPPLIER: Exact company name from this document (look for "Pty Ltd", "LLC", "Inc")
- INVOICE NUMBER: Exact invoice/bill number printed on this document
- DATES: Convert to YYYY-MM-DD format (e.g., "16 Sep 2025" → "2025-09-16")
- AMOUNTS: Exact numeric values for Total, Subtotal, Tax/GST from this document
- LINE ITEMS: Every line item with exact description, qty, rate, amount from this document

CONFIDENCE SCORING (be honest):
- 0.95+: All fields clearly visible and accurately extracted from THIS document
- 0.85-0.94: Most fields clear with minor ambiguity
- 0.70-0.84: Some fields unclear or partially visible
- Below 0.70: Significant data missing or unclear

Return structured JSON with data from THIS specific document only.`
      },
      {
        role: 'user',
        content: contentArray
      }
    ];

    // Step 3: Send to Lovable AI for structured extraction
    console.log('Sending to Lovable AI for structured extraction...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
