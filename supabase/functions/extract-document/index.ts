import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { document_id } = await req.json();

    if (!document_id) {
      return new Response(
        JSON.stringify({ error: 'document_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document ID: ${document_id}`);

    // Update status to processing
    await supabase
      .from('project_documents')
      .update({ 
        processing_status: 'processing',
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id);

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from('project_documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message || 'Unknown error'}`);
    }

    console.log(`Processing document: ${document.name}, URL: ${document.file_url}`);

    // PDF Intake Validator
    console.log('🔍 Starting PDF validation...');
    const headResponse = await fetch(document.file_url, { method: 'HEAD' });
    
    if (!headResponse.ok) {
      throw new Error(`Failed to access PDF: ${headResponse.status} ${headResponse.statusText}`);
    }

    const contentType = headResponse.headers.get('content-type');
    const contentLength = parseInt(headResponse.headers.get('content-length') || '0');

    console.log(`Validation - Status: ${headResponse.status}, Content-Type: ${contentType}, Size: ${contentLength} bytes`);

    if (!contentType?.includes('application/pdf')) {
      throw new Error(`Invalid content type: ${contentType}. Expected application/pdf`);
    }

    const maxSize = 75 * 1024 * 1024; // 75MB
    if (contentLength > maxSize) {
      throw new Error(`File too large: ${Math.round(contentLength / 1024 / 1024)}MB. Maximum size is 75MB. Please downsample the PDF.`);
    }

    // Update metadata with validation info
    const metadata = {
      validation: {
        status_code: headResponse.status,
        content_type: contentType,
        content_length: contentLength,
        validated_at: new Date().toISOString()
      }
    };

    // Download PDF for processing
    console.log('📥 Downloading PDF for text analysis...');
    const pdfResponse = await fetch(document.file_url);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`Downloaded PDF: ${pdfBuffer.byteLength} bytes`);

    // Text-Layer Sniff using OpenAI Vision to determine if it's text-based or image-only
    console.log('🔍 Analyzing PDF type (text vs image-based)...');
    
    // Convert first few pages to base64 for OpenAI analysis
    const bytes = new Uint8Array(pdfBuffer);
    let base64 = '';
    const chunkSize = 8192;
    for (let i = 0; i < Math.min(bytes.length, 1024 * 1024); i += chunkSize) { // Limit to 1MB for type detection
      const chunk = bytes.slice(i, i + chunkSize);
      const chunkArray = Array.from(chunk);
      const chunkString = String.fromCharCode(...chunkArray);
      base64 += btoa(chunkString);
    }

    // Analyze document type
    const typeAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Analyze this PDF to determine if it contains readable text layers or if it\'s primarily image-based (scanned/outlined CAD). Respond with JSON: {"image_only": boolean, "confidence": number, "rationale": "reason"}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this PDF and determine if it has text layers or is image-only. Look for readable text, CAD elements, and document structure.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!typeAnalysisResponse.ok) {
      console.warn('Type analysis failed, defaulting to text extraction');
      var image_only = false;
      var confidence = 0.5;
      var rationale = 'Type analysis failed, attempting text extraction';
    } else {
      const typeData = await typeAnalysisResponse.json();
      const analysisResult = JSON.parse(typeData.choices[0]?.message?.content || '{"image_only": false, "confidence": 0.5, "rationale": "default"}');
      var { image_only, confidence, rationale } = analysisResult;
    }

    console.log(`📊 Document type analysis: image_only=${image_only}, confidence=${confidence}, rationale=${rationale}`);

    let extractedText = '';
    let pages: Array<{page: number, text: string}> = [];
    let extractionMethod = '';

    if (image_only) {
      // OCR Extractor for scanned/outlined CAD sheets
      console.log('🖼️ Using OCR extraction for image-based PDF...');
      extractionMethod = 'ocr-vision';
      
      // Convert full PDF to base64 for OCR
      const fullBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
      
      const ocrResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are an OCR specialist for architectural and construction documents. Extract ALL visible text with high precision, including project names, addresses, measurements, specifications, drawing numbers, dates, notes, and any other readable text. Maintain text structure and organization.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Perform precise OCR on this architectural/construction PDF. Extract all visible text including project details, measurements, specifications, and technical information. Organize the extracted text clearly.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${fullBase64}`,
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

      if (ocrResponse.ok) {
        const ocrData = await ocrResponse.json();
        extractedText = ocrData.choices[0]?.message?.content || '';
        pages = [{ page: 1, text: extractedText }];
        console.log(`✅ OCR extraction completed: ${extractedText.length} characters`);
      } else {
        throw new Error('OCR extraction failed');
      }
      
    } else {
      // Text Extractor for text-based PDFs
      console.log('📝 Using text extraction for text-based PDF...');
      extractionMethod = 'text-layer';
      
      // Use OpenAI to extract text from text-based PDF
      const fullBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
      
      const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'Extract all text content from this text-based PDF document. Preserve structure and organization. Focus on project information, specifications, measurements, and technical details.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text from this PDF document, maintaining structure and organization. Include project details, specifications, measurements, and any technical information.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${fullBase64}`,
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

      if (textResponse.ok) {
        const textData = await textResponse.json();
        extractedText = textData.choices[0]?.message?.content || '';
        pages = [{ page: 1, text: extractedText }];
        console.log(`✅ Text extraction completed: ${extractedText.length} characters`);
      } else {
        throw new Error('Text extraction failed');
      }
    }

    // Generate AI summary and analysis
    console.log('🤖 Generating AI summary and analysis...');
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Create a 2-3 sentence summary of this architectural/construction document. Focus on the main purpose, key information, and document type.'
          },
          {
            role: 'user',
            content: `Summarize this document content: ${extractedText.substring(0, 2000)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    let aiSummary = 'Document processed successfully';
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      aiSummary = summaryData.choices[0]?.message?.content || aiSummary;
    }

    // Calculate confidence based on extraction success
    const aiConfidence = Math.min(0.95, Math.max(0.1, extractedText.length / 1000 * 0.8 + confidence * 0.2));
    
    // Create detailed rationale
    const aiRationale = `${image_only ? 'Image-based PDF processed with OCR' : 'Text-based PDF processed with text extraction'} using ${extractionMethod}. ${extractedText.length} characters extracted with ${Math.round(aiConfidence * 100)}% confidence.`;

    // Update final metadata
    const finalMetadata = {
      ...metadata,
      extraction: {
        method: extractionMethod,
        image_only,
        pages_processed: pages.length,
        characters_extracted: extractedText.length,
        confidence_score: confidence,
        processed_at: new Date().toISOString()
      }
    };

    // Update database with results
    const { error: updateError } = await supabase
      .from('project_documents')
      .update({
        extracted_text: extractedText,
        ai_summary: aiSummary,
        ai_confidence: aiConfidence,
        ai_rationale: aiRationale,
        metadata: finalMetadata,
        image_only,
        processing_status: 'completed',
        file_size: contentLength,
        content_type: contentType,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    console.log('✅ Document processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        pages,
        full_text: extractedText,
        ai_summary: aiSummary,
        ai_confidence: aiConfidence,
        ai_rationale: aiRationale,
        image_only,
        extraction_method: extractionMethod,
        metadata: finalMetadata
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in extract-document function:', error);

    // Try to update document status with error
    if (document_id) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('project_documents')
          .update({
            processing_status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', document_id);
      } catch (dbError) {
        console.error('Failed to update error status:', dbError);
      }
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        document_id: document_id || null,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});