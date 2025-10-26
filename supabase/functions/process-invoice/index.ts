import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest, ProcessInvoiceRequest } from "./schemas.ts";

// Import PDF.js for text extraction
import * as pdfjsLib from "npm:pdfjs-dist@4.0.379/legacy/build/pdf.mjs";

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

// Extract text from PDF using PDF.js
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    console.log('=== EXTRACTING TEXT FROM PDF ===');
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      useSystemFonts: true,
      standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/",
    });
    
    const pdfDoc = await loadingTask.promise;
    console.log(`PDF loaded: ${pdfDoc.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      console.log(`Page ${pageNum} text extracted: ${pageText.length} chars`);
    }
    
    console.log(`Total extracted text: ${fullText.length} characters`);
    return fullText.trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

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

    // Step 2: Extract text from PDF or prepare image
    console.log('=== DOCUMENT PROCESSING ===');
    let documentContent: string;
    
    if (fileType === 'pdf') {
      // For PDFs: Extract text content
      console.log('Extracting text from PDF...');
      documentContent = await extractTextFromPDF(bytes);
      console.log('Text extraction complete');
      console.log('Extracted text preview:', documentContent.substring(0, 500));
    } else {
      // For images: Convert to base64 for vision processing
      console.log('Processing image with vision...');
      const base64Data = arrayBufferToBase64(bytes);
      const mimeType = getMimeType(filename);
      documentContent = `IMAGE:${mimeType}:${base64Data}`;
    }

    // Step 3: Send to AI for structured extraction
    console.log('=== SENDING TO AI FOR EXTRACTION ===');
    
    let aiMessages;
    
    if (fileType === 'pdf') {
      // For PDFs with extracted text
      aiMessages = [
        {
          role: 'system',
          content: `You are an expert invoice data extraction system. Extract structured data from the invoice text provided.

EXTRACTION RULES:
1. SUPPLIER: Full company name (look for "Pty Ltd", "LLC", "Inc", etc.)
2. INVOICE NUMBER: The invoice/bill reference number
3. DATES: Convert to YYYY-MM-DD format (e.g., "16 Sep 2025" → "2025-09-16")
4. AMOUNTS: Numeric values only for Total, Subtotal, Tax/GST
5. LINE ITEMS: Each item with description, quantity, rate, amount

Be precise with data extraction. Set high confidence (0.9+) only if all fields are clearly present.`
        },
        {
          role: 'user',
          content: `Extract invoice data from this text:\n\n${documentContent}`
        }
      ];
    } else {
      // For images with vision
      const [_, mimeType, base64Data] = documentContent.split(':');
      aiMessages = [
        {
          role: 'system',
          content: 'You are an expert at extracting invoice data from images. Analyze the image and extract all fields accurately.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all invoice data from this image including supplier, invoice number, dates, amounts, and line items.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'high'
              }
            }
          ]
        }
      ];
    }
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
