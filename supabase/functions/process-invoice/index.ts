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

    // Build the content array - PDFs use inline_data, images use image_url
    const contentArray: any[] = [
      {
        type: 'text',
        text: `Analyze this ${fileType === 'pdf' ? 'PDF invoice/bill' : 'invoice/bill image'} and extract ALL data:

Extract:
- Full company name as supplier
- Invoice/bill number
- Invoice date and due date in YYYY-MM-DD format
- ALL amounts visible (Subtotal, Tax/GST, Total, line item amounts, etc.)
- ALL line items with descriptions, quantities, rates, and amounts
- Reference numbers if present

IMPORTANT: Look at EVERY number in the document. Don't assume amounts are zero - read them directly from the document.
Be precise with ALL numbers and dates. Set high confidence (0.9+) if the document is clear and readable.`
      }
    ];

    // For PDFs, use inline_data format; for images, use image_url format
    if (fileType === 'pdf') {
      contentArray.push({
        type: 'inline_data',
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    } else {
      contentArray.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`,
          detail: 'high'
        }
      });
    }

    const aiMessages = [
      {
        role: 'system',
        content: `You are an expert at extracting invoice/receipt/bill data from documents. Analyze the document carefully and extract all visible information accurately.

EXTRACTION RULES:
1. SUPPLIER: The company issuing the invoice (look for "Pty Ltd", "LLC", "Inc", full company name)
2. INVOICE NUMBER: The reference code visible on the document
3. DATES: Convert all dates to YYYY-MM-DD format (e.g., "10 Oct 2025" → "2025-10-10")
4. AMOUNTS: Extract exact numeric values for Total, Subtotal, and Tax/GST
5. LINE ITEMS: Each item with description, quantity (if shown), rate (if shown), and amount

CONFIDENCE SCORING:
- 0.95+: All fields clearly visible and extracted
- 0.85-0.94: Most fields clear, some minor ambiguity
- 0.70-0.84: Some fields unclear or partially visible
- Below 0.70: Significant data missing or unclear

Look carefully at ALL text in the document. Don't miss any numbers or amounts. Return structured JSON matching the schema.`
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
