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

    // Check file size limit (10MB max for OpenAI)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ 
          error: 'PDF file too large for processing',
          suggestion: 'Please reduce the file size to under 10MB and try again.',
          maxSize: '10MB',
          currentSize: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
        }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Convert PDF to base64 for OpenAI Vision API using chunks to prevent stack overflow
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to prevent stack overflow
      let base64 = '';
      const chunkSize = 8192; // 8KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        const chunkString = String.fromCharCode.apply(null, Array.from(chunk));
        base64 += btoa(chunkString);
      }
      
      console.log('Sending PDF to OpenAI for text extraction...');

      // Use OpenAI Vision API to extract text from PDF
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
              content: 'You are a helpful assistant that extracts all visible text from PDF documents. Extract all text content including project names, addresses, dates, measurements, specifications, and any other readable information. Preserve the structure and organization of the information as much as possible.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please extract all text content from this PDF document. Include project information, addresses, specifications, measurements, dates, and any other readable text.'
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
        
        if (response.status === 413) {
          return new Response(
            JSON.stringify({ 
              error: 'PDF too large for OpenAI processing',
              suggestion: 'Please reduce the PDF file size and try again.',
              errorCode: 'FILE_TOO_LARGE'
            }),
            { 
              status: 413, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const extractedText = data.choices[0]?.message?.content || '';

      console.log(`Successfully extracted ${extractedText.length} characters using OpenAI`);

      if (extractedText.length < 10) {
        console.warn('Very little text extracted from PDF');
        return new Response(
          JSON.stringify({ 
            text: "PDF processed but limited text could be extracted. This may be a scanned document or contain mostly images/graphics.",
            numPages: 1,
            fileName: file.name,
            extractedLength: 0,
            warning: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          text: extractedText,
          numPages: 1, // OpenAI processes the entire PDF
          fileName: file.name,
          extractedLength: extractedText.length,
          method: 'openai-vision',
          success: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (conversionError) {
      console.error('Error converting PDF to base64:', conversionError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process PDF format',
          suggestion: 'The PDF may be corrupted or in an unsupported format. Please try with a different PDF.',
          errorCode: 'CONVERSION_FAILED'
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
    let suggestion = 'Please ensure the PDF is not corrupted and try again.';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.message.includes('OpenAI API key')) {
      errorMessage = 'OpenAI API configuration error';
      suggestion = 'Please contact support - API configuration needs to be updated.';
      errorCode = 'API_CONFIG_ERROR';
    } else if (error.message.includes('Maximum call stack')) {
      errorMessage = 'PDF processing memory limit exceeded';
      suggestion = 'Please try with a smaller PDF file or contact support.';
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