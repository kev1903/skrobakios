import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured in edge function secrets');
    }

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

    // Check file size limit (20MB max for better processing)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF file too large for processing',
          suggestion: 'Please reduce the file size to under 20MB and try again.',
          maxSize: '20MB',
          currentSize: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
        }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Convert PDF to base64 for OpenAI
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to prevent stack overflow
      let base64 = '';
      const chunkSize = 8192; // 8KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        const chunkArray = Array.from(chunk);
        const chunkString = String.fromCharCode(...chunkArray);
        base64 += btoa(chunkString);
      }
      
      console.log('Sending PDF to OpenAI for text extraction...');

      // Since OpenAI Vision API doesn't directly support PDFs, we'll try a different approach
      // Use the text extraction focused prompt with document analysis
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a specialized text extraction assistant for architectural and construction documents. 

CRITICAL: The user is sending you a PDF document as base64. Even though the image_url shows a PDF data URL, treat this as a document image and extract ALL visible text content.

Extract and structure the following information:
1. Project name/title
2. Project address/location  
3. Drawing numbers and dates
4. Client information
5. Architect/designer details
6. Technical specifications
7. Measurements and dimensions
8. Material specifications
9. Any other readable text

Provide the extracted text in a clear, organized format. If you cannot see readable text, state that clearly.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text content from this architectural/construction PDF document. Focus on project details, specifications, measurements, and any other readable information. This is a vector-based PDF that should contain readable text.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        
        // Handle specific OpenAI errors
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ 
              error: 'OpenAI API authentication failed',
              suggestion: 'Please check your OpenAI API key configuration.',
              errorCode: 'AUTH_FAILED'
            }),
            { 
              status: 401, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        if (response.status === 413 || response.status === 400) {
          return new Response(
            JSON.stringify({ 
              error: 'PDF format or size issue with OpenAI processing',
              suggestion: 'Try converting the PDF to images first, or reduce file size.',
              errorCode: 'FORMAT_ERROR'
            }),
            { 
              status: 422, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const extractedText = data.choices[0]?.message?.content || '';

      console.log(`Successfully extracted ${extractedText.length} characters using OpenAI`);

      if (extractedText.length < 20) {
        console.warn('Very little text extracted from PDF');
        return new Response(
          JSON.stringify({ 
            text: extractedText || "PDF processed but limited text could be extracted. This may be due to PDF format compatibility.",
            numPages: 1,
            fileName: file.name,
            extractedLength: extractedText.length,
            warning: true,
            method: 'openai-vision-pdf'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          text: extractedText,
          numPages: 1,
          fileName: file.name,
          extractedLength: extractedText.length,
          method: 'openai-vision-pdf',
          success: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (conversionError) {
      console.error('Error processing PDF:', conversionError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process PDF format',
          suggestion: 'The PDF may have compatibility issues with the extraction engine. Try converting to a different PDF version.',
          errorCode: 'CONVERSION_FAILED',
          details: conversionError.message
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    
    // Handle different types of errors with specific messages
    let errorMessage = 'Failed to process PDF: ' + error.message;
    let suggestion = 'Please ensure the PDF is a valid vector-based document.';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.message.includes('OpenAI API key')) {
      errorMessage = 'OpenAI API configuration error';
      suggestion = 'Please contact support - API configuration needs to be updated.';
      errorCode = 'API_CONFIG_ERROR';
    } else if (error.message.includes('Maximum call stack')) {
      errorMessage = 'PDF processing memory limit exceeded';
      suggestion = 'Please try with a smaller PDF file.';
      errorCode = 'MEMORY_LIMIT';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        suggestion: suggestion,
        errorCode: errorCode
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});