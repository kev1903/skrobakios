// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Enhanced PDF text extraction using npm:pdf-parse for Deno
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    console.log('Starting PDF text extraction...');
    
    // Try using pdf-parse package (works better in Deno)
    try {
      const pdfParse = (await import("npm:pdf-parse@1.1.1")).default;
      const buffer = new Uint8Array(pdfBytes);
      const data = await pdfParse(buffer);
      
      if (data.text && data.text.length > 50) {
        console.log(`✓ Successfully extracted ${data.text.length} characters using pdf-parse`);
        console.log('Sample text:', data.text.substring(0, 500));
        return cleanAndStructureText(data.text);
      }
    } catch (pdfParseError) {
      console.warn("pdf-parse failed, trying fallback:", pdfParseError.message);
    }

    // Fallback: Enhanced manual extraction
    console.log("Using enhanced manual extraction");
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(pdfBytes);
    
    // Extract text between common PDF text markers
    const textPatterns = [
      // Match text in parentheses (common PDF text encoding)
      /\(([^)]+)\)/g,
      // Match text in angle brackets (hex encoding)
      /<([0-9A-Fa-f\s]+)>/g,
      // Match BT...ET blocks (text blocks)
      /BT\s+([\s\S]*?)\s+ET/g,
      // Match Tj and TJ operators (text showing)
      /\[(.*?)\]\s*TJ/g,
      /\((.*?)\)\s*Tj/g,
    ];
    
    let extractedParts: string[] = [];
    
    for (const pattern of textPatterns) {
      const matches = rawText.matchAll(pattern);
      for (const match of matches) {
        let text = match[1];
        
        // Handle hex-encoded text
        if (pattern.source.includes('0-9A-Fa-f')) {
          try {
            text = text.replace(/\s/g, '');
            const bytes = text.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
            text = String.fromCharCode(...bytes);
          } catch (e) {
            continue;
          }
        }
        
        // Clean and add text
        text = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\(.)/g, '$1')
          .trim();
        
        if (text.length > 2) {
          extractedParts.push(text);
        }
      }
    }
    
    const finalText = extractedParts.join(' ').trim();
    console.log(`Manual extraction produced ${finalText.length} characters`);
    console.log('Sample:', finalText.substring(0, 300));
    
    if (finalText.length < 50) {
      throw new Error('Insufficient text extracted from PDF');
    }
    
    return cleanAndStructureText(finalText);
    
  } catch (error) {
    console.error("All PDF extraction methods failed:", error);
    throw new Error('Failed to extract text from PDF. The document may be image-based or corrupted.');
  }
}

// Clean and structure extracted text for better AI processing
function cleanAndStructureText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remove common PDF artifacts
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    // Remove excessive punctuation
    .replace(/\.{4,}/g, '...')
    .replace(/-{4,}/g, '---')
    // Remove page markers
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\f/g, '\n')
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const body = await req.json();
    const { signed_url, filename, filesize, storage_path } = body;

    console.log('=== Processing invoice ===');
    console.log('Filename:', filename);
    console.log('Filesize:', filesize);
    console.log('Storage path:', storage_path);

    if (!signed_url) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing signed_url parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Download PDF from signed URL
    console.log('Downloading file from storage...');
    const bytes = await fetchAsArrayBuffer(signed_url);
    console.log('Downloaded file, size:', bytes.byteLength);

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (bytes.byteLength > maxSize) {
      const sizeMB = (bytes.byteLength / 1024 / 1024).toFixed(2);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `File too large (${sizeMB}MB). Maximum is 5MB. Please compress at https://www.ilovepdf.com/compress_pdf` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Extract text from PDF
    console.log('Extracting text from PDF...');
    const extractedText = await extractTextFromPDF(bytes);
    console.log('Extracted text length:', extractedText.length);

    if (extractedText.length < 20) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to extract meaningful text from PDF' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Send extracted TEXT to Lovable AI
    console.log('Calling Lovable AI for invoice extraction...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting invoice/bill data from text. Extract ONLY the visible invoice information accurately.

CRITICAL EXTRACTION RULES:
1. SUPPLIER: The company ISSUING the invoice (with company name like "Pty Ltd", "LLC", "Inc")
2. INVOICE NUMBER: The short reference code (e.g., "TUL3801", "INV-001") - NOT long hashes
3. AMOUNTS: Extract EXACT numeric values for TOTAL, SUBTOTAL, and TAX from the invoice
4. DATES: Convert to YYYY-MM-DD format (e.g., "10 Oct 2025" → "2025-10-10")
5. LINE ITEMS: Each item with description and amount

Set confidence to 0.9+ if the invoice is clearly readable with all key fields present.
Set confidence to 0.7-0.8 if some fields are unclear.
Set confidence below 0.5 only if the document is severely corrupted.

Return only valid JSON matching the schema.`
          },
          {
            role: 'user',
            content: `Extract structured invoice data from this text:

${extractedText}

IMPORTANT:
- Extract the ACTUAL company name issuing the invoice (look for "Pty Ltd", "LLC", "Inc" in company details)
- Extract the SHORT invoice number (e.g., "TUL3801"), not internal system IDs
- Extract EXACT amounts as shown (Total, Subtotal, Tax/GST)
- Include ALL line items with descriptions and amounts
- Convert dates to YYYY-MM-DD format

Provide high confidence (0.9+) if all fields are clearly visible.`
          }
        ],
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
          JSON.stringify({ ok: false, error: 'AI credits required. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

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
    console.log('Confidence:', extractedData.ai_confidence);
    console.log('Full data:', JSON.stringify(extractedData, null, 2));

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
