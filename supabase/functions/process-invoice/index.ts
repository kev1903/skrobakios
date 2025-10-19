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
      supplier: { type: "string", description: "Supplier/vendor company name" },
      supplier_email: { type: "string", description: "Supplier email address" },
      invoice_number: { type: "string", description: "Invoice or bill number" },
      reference_number: { type: "string", description: "Purchase order or reference number" },
      invoice_date: { type: "string", description: "Invoice date in YYYY-MM-DD format" },
      due_date: { type: "string", description: "Payment due date in YYYY-MM-DD format" },
      subtotal: { type: "string", description: "Subtotal amount before tax" },
      tax: { type: "string", description: "Tax/GST amount" },
      total: { type: "string", description: "Total amount including tax" },
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
          required: ["description", "qty", "rate", "amount"]
        }
      },
      ai_summary: { type: "string", description: "Brief 2-3 sentence summary of the invoice" },
      ai_confidence: { type: "number", description: "Confidence score from 0 to 1", minimum: 0, maximum: 1 }
    },
    required: ["supplier", "invoice_number", "total", "ai_summary", "ai_confidence"]
  }
};

// Smart text preprocessing to reduce token count
function preprocessText(text: string, maxTokens: number = 100000): string {
  let processed = text
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(.*?)\n\1+$/gm, '$1')
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\f/g, ' ')
    .replace(/\.{3,}/g, '...')
    .replace(/-{3,}/g, '---')
    .trim();

  if (processed.length > maxTokens * 4) {
    const sections = processed.split(/\n\s*\n/);
    const importantSections = sections.filter(section => {
      const keywords = [
        'invoice', 'bill', 'total', 'subtotal', 'tax', 'gst', 'amount',
        'date', 'due', 'payment', 'supplier', 'vendor', 'customer', 'qty', 'quantity'
      ];
      return keywords.some(keyword => 
        section.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    const selectedSections = [
      ...importantSections.slice(0, 10),
      ...sections.slice(0, 5)
    ];
    
    processed = [...new Set(selectedSections)].join('\n\n');
  }

  return processed;
}

// Enhanced PDF text extraction using canvas-based approach
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    // Try PDF.js extraction with proper initialization
    try {
      const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm");
      
      // Set worker source - use jsdelivr CDN for consistency
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
      }
      
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBytes),
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      // Extract all pages for invoices (usually short documents)
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }
      
      if (fullText.trim()) {
        console.log("PDF.js extraction successful, pages:", totalPages);
        return preprocessText(cleanExtractedText(fullText));
      }
    } catch (pdfJsError) {
      console.warn("PDF.js extraction failed:", pdfJsError);
    }
    
    // Fallback to manual extraction
    console.log("Using fallback text extraction");
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(pdfBytes);
    
    const patterns = [
      /BT\s+(.*?)\s+ET/gs,
      /stream\s+(.*?)\s+endstream/gs,
      /\((.*?)\)/g,
      /<([0-9A-Fa-f\s]+)>/g
    ];
    
    let extractedText = '';
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
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
    
    const finalText = extractedText.trim() || "Unable to extract readable text from PDF";
    return preprocessText(finalText);
    
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    return "PDF text extraction failed - document may be image-based";
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n')
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
    console.log('First 1000 chars of extracted text:', extractedText.substring(0, 1000));

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
            content: `You are an expert at extracting invoice/bill data from text. Extract ONLY the visible invoice information, ignoring any system metadata, IDs, or software watermarks.

CRITICAL EXTRACTION RULES:
1. SUPPLIER IDENTIFICATION:
   - Look for company names with "Pty Ltd", "LLC", "Inc", etc.
   - The supplier is typically at the top of the invoice with their ABN/ACN
   - IGNORE software names like "Xero", "QuickBooks", "FreshBooks" - these are NOT the supplier
   - Look for phrases like "Invoice from:", "Billed by:", or the company details section

2. INVOICE NUMBER:
   - Look for fields labeled "Invoice Number:", "Invoice #:", "Bill #:"
   - Usually a short alphanumeric code (e.g., "TUL3801", "INV-001")
   - IGNORE long random hashes or UUIDs - these are system IDs, not invoice numbers

3. AMOUNTS:
   - Extract TOTAL, SUBTOTAL, and TAX/GST amounts from the invoice
   - Look for clearly labeled amount fields
   - If subtotal not shown, calculate it as: Total - Tax

4. DATES:
   - Extract invoice date and due date
   - Convert to YYYY-MM-DD format (e.g., "17 Oct 2025" → "2025-10-17")

5. LINE ITEMS:
   - Extract each line with description, quantity, rate, and amount
   - Look for item descriptions and their corresponding prices

Return only valid JSON matching the schema.`
          },
          {
            role: 'user',
            content: `Extract structured invoice data from this text. Focus on the DISPLAYED invoice content, not metadata:

${extractedText}

IMPORTANT:
- The SUPPLIER is the company ISSUING the invoice (with ABN/company details at top)
- The INVOICE NUMBER is the short reference code (like "TUL3801", not a long hash)
- Extract ACTUAL amounts shown in the invoice (Total, Subtotal, Tax/GST)
- Include all line items with their descriptions, quantities, and prices
- Ignore any software watermarks (Xero, QuickBooks, etc.)

Set confidence based on how clearly you can read these fields (0.9+ if very clear).`
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
    console.log('Extracted invoice data:', JSON.stringify(extractedData, null, 2));

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
