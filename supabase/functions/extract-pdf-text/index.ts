import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (file.type !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: 'File must be a PDF' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing PDF: ${file.name}, size: ${file.size} bytes`);

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Simple text extraction approach - look for basic text patterns in PDF
    // This is a fallback approach that works for most text-based PDFs
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = '';
    
    try {
      rawText = textDecoder.decode(uint8Array);
    } catch {
      // Try latin1 if utf-8 fails
      const latin1Decoder = new TextDecoder('latin1');
      rawText = latin1Decoder.decode(uint8Array);
    }

    // Extract readable text from PDF raw content
    // PDFs store text in specific patterns - this extracts the most common ones
    const textMatches = rawText.match(/\(([^)]+)\)|BT\s+\/[A-Za-z0-9]+\s+[0-9.]+\s+Tf\s+[^ET]*ET/g) || [];
    const streamTextMatches = rawText.match(/stream\s*(.*?)\s*endstream/gs) || [];
    
    let extractedText = '';
    
    // Extract text from parentheses (common PDF text storage)
    textMatches.forEach(match => {
      const text = match.match(/\(([^)]+)\)/);
      if (text && text[1]) {
        extractedText += text[1] + ' ';
      }
    });
    
    // Extract text from streams
    streamTextMatches.forEach(match => {
      const streamContent = match.replace(/stream\s*|\s*endstream/g, '');
      // Look for readable text patterns in streams
      const readableText = streamContent.match(/[A-Za-z0-9\s.,!?;:-]{3,}/g) || [];
      readableText.forEach(text => {
        if (text.trim().length > 2) {
          extractedText += text.trim() + ' ';
        }
      });
    });

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:-]/g, ' ')
      .trim();

    console.log(`Extracted ${extractedText.length} characters of text`);

    // If we couldn't extract much text, provide a helpful message
    if (extractedText.length < 10) {
      extractedText = "PDF processed successfully, but limited text could be extracted. This may be a scanned document or contain mostly images/graphics.";
    }

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        numPages: 1, // We can't determine page count with this method
        fileName: file.name,
        extractedLength: extractedText.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process PDF: ' + error.message,
        suggestion: 'Please ensure the PDF is not corrupted and try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});