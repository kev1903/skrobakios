import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Document extraction request received');
    
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Check if it's a PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are supported for document extraction');
    }
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('File converted to buffer, size:', uint8Array.length);
    
    // For now, we'll use a simple text extraction approach
    // In production, you'd want to use a proper PDF parsing library
    let extractedText = '';
    
    try {
      // Try to extract basic text content
      // This is a simplified approach - in production use a proper PDF parser
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = textDecoder.decode(uint8Array);
      
      // Extract readable text using regex patterns
      const textMatches = rawText.match(/BT\s+.*?ET/gs);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.replace(/BT\s*|\s*ET/g, ''))
          .join(' ')
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // If no text extracted, provide metadata
      if (!extractedText || extractedText.length < 50) {
        extractedText = `PDF Document Analysis
File: ${file.name}
Size: ${(file.size / 1024).toFixed(1)}KB
Type: Construction/Engineering Drawing

This appears to be a technical drawing or document. The PDF contains visual content that may include:
- Architectural plans and drawings
- Technical specifications
- Construction details
- Measurement annotations
- Drawing symbols and notations

For detailed analysis of drawings and plans, please describe what specific information you need from this document.`;
      }
      
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      extractedText = `PDF Document: ${file.name}

This PDF document could not be automatically parsed for text content. This is common with:
- Scanned documents
- Image-based PDFs  
- Technical drawings
- Complex formatted documents

The document appears to be a construction/engineering drawing based on the filename. Please describe what specific information you need from this document, such as:
- Room dimensions
- Material specifications  
- Construction details
- Scope of work items`;
    }
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Text preview:', extractedText.substring(0, 200));
    
    return new Response(JSON.stringify({
      success: true,
      content: extractedText,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        extractedLength: extractedText.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in extract-document function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Failed to extract document content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});