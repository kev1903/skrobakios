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
const ocrEngine = Deno.env.get('OCR_ENGINE') || 'tesseract';
const tmpDir = Deno.env.get('TMP_DIR') || '/tmp';
const forceOcr = Deno.env.get('FORCE_OCR') === '1';

// Enhanced fetch with timeouts and streaming
async function fetchWithTimeout(url: string, options: any = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const rawPath = url.pathname;
  // Normalize path when called via supabase.functions.invoke('extract-document')
  // Example incoming path: /functions/v1/extract-document -> we want '/'
  const path = rawPath.replace(/^\/functions\/v1\/[^/]+/, '') || '/';

  // Health endpoint
  if (req.method === 'GET' && (path === '/health' || rawPath.endsWith('/health'))) {
    return new Response(
      JSON.stringify({
        ok: true,
        env: {
          OCR_ENGINE: ocrEngine,
          TMP_DIR: tmpDir,
          FORCE_OCR: forceOcr
        },
        time: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Debug fetch endpoint
  if (req.method === 'POST' && path === '/debug/fetch') {
    try {
      const { url: testUrl } = await req.json();
      
      if (!testUrl) {
        return new Response(
          JSON.stringify({ ok: false, error: 'URL is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let headResult: any = {};
      let getResult: any = {};
      let hint = '';
      let error = '';

      try {
        // HEAD request
        const headResponse = await fetchWithTimeout(testUrl, { method: 'HEAD' });
        headResult = {
          status: headResponse.status,
          headers: Object.fromEntries(headResponse.headers.entries())
        };
      } catch (e) {
        headResult = { error: e.message };
        error = e.message;
      }

      try {
        // GET request
        const getResponse = await fetchWithTimeout(testUrl);
        const bytes = await getResponse.arrayBuffer();
        getResult = {
          status: getResponse.status,
          headers: Object.fromEntries(getResponse.headers.entries()),
          bytes: bytes.byteLength,
          contentType: getResponse.headers.get('content-type')
        };

        // Generate hints
        if (getResponse.status === 403) {
          hint = "Download failed (403) — likely an expired signed URL. Re-upload or refresh link.";
        } else if (getResponse.status === 404) {
          hint = "File not found (404) — check if the URL is correct or file was deleted.";
        } else if (!getResponse.ok) {
          hint = `Server returned ${getResponse.status}. Check permissions or URL validity.`;
        } else if (!getResult.contentType?.includes('application/pdf')) {
          hint = `Content-Type is '${getResult.contentType}', expected 'application/pdf'. May be a redirect or wrong file.`;
        } else {
          hint = "Download successful, ready for processing.";
        }
      } catch (e) {
        getResult = { error: e.message };
        if (!error) error = e.message;
      }

      return new Response(
        JSON.stringify({
          ok: !error,
          head: headResult,
          get: getResult,
          hint,
          error: error || undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: error.message,
          hint: "Debug fetch failed - check request format"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Main extract endpoint
  if (req.method === 'POST' && (path === '/extract' || path === '/')) {
    let document_id: string | undefined;
    
    try {
      if (!openAIApiKey) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'setup',
            hint: 'OpenAI API key not configured',
            error: 'Missing OPENAI_API_KEY environment variable'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await req.json();
      document_id = body.document_id;
      const forceOcrRequest = body.force_ocr === true;

      if (!document_id) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'validation',
            hint: 'document_id is required in request body',
            error: 'Missing document_id parameter'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing document ID: ${document_id}${forceOcrRequest ? ' (FORCE OCR)' : ''}`);

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
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'fetch',
            hint: 'Document not found in database',
            error: docError?.message || 'Document not found',
            meta: { document_id }
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing document: ${document.name}, URL: ${document.file_url}`);

      // PDF Intake Validator
      console.log('🔍 Starting PDF validation...');
      
      let headResponse: Response;
      let contentType: string | null;
      let contentLength: number;
      
      try {
        headResponse = await fetchWithTimeout(document.file_url, { method: 'HEAD' });
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint: 'Unable to connect to file URL. Check network connectivity or URL validity.',
            error: error.message,
            meta: { 
              urlHost: new URL(document.file_url).hostname,
              document_id 
            }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!headResponse.ok) {
        const hint = headResponse.status === 403 
          ? "Download failed (403) — likely an expired signed URL. Re-upload or refresh link."
          : headResponse.status === 404
          ? "File not found (404) — check if the URL is correct or file was deleted."
          : `Source returned ${headResponse.status}. Check permissions or signed URL expiry.`;
          
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint,
            status: headResponse.status,
            error: `HTTP ${headResponse.status}: ${headResponse.statusText}`,
            meta: { 
              urlHost: new URL(document.file_url).hostname,
              document_id 
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      contentType = headResponse.headers.get('content-type');
      contentLength = parseInt(headResponse.headers.get('content-length') || '0');

      console.log(`Validation - Status: ${headResponse.status}, Content-Type: ${contentType}, Size: ${contentLength} bytes`);

      if (!contentType?.includes('application/pdf')) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint: `Content-Type is '${contentType}', expected 'application/pdf'. May be a redirect or wrong file.`,
            error: `Invalid content type: ${contentType}`,
            meta: { 
              contentType,
              urlHost: new URL(document.file_url).hostname,
              document_id 
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const maxSize = 75 * 1024 * 1024; // 75MB
      if (contentLength > maxSize) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint: `File too large: ${Math.round(contentLength / 1024 / 1024)}MB. Maximum size is 75MB. Please downsample the PDF.`,
            error: `File size ${Math.round(contentLength / 1024 / 1024)}MB exceeds limit`,
            meta: { 
              contentLength,
              maxSize,
              document_id 
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update metadata with validation info
      const metadata = {
        validation: {
          status_code: headResponse.status,
          content_type: contentType,
          content_length: contentLength,
          validated_at: new Date().toISOString(),
          force_ocr: forceOcrRequest || forceOcr
        }
      };

      // Download PDF for processing
      console.log('📥 Downloading PDF for text analysis...');
      let pdfResponse: Response;
      
      try {
        pdfResponse = await fetchWithTimeout(document.file_url);
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint: 'Failed to download PDF content. Check network connectivity.',
            error: error.message,
            meta: { document_id }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!pdfResponse.ok) {
        const hint = pdfResponse.status === 403 
          ? "Download failed (403) — likely an expired signed URL. Re-upload or refresh link."
          : `Source returned ${pdfResponse.status}. Check permissions or signed URL expiry.`;
          
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'download',
            hint,
            status: pdfResponse.status,
            error: `HTTP ${pdfResponse.status}: ${pdfResponse.statusText}`,
            meta: { document_id }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log(`Downloaded PDF: ${pdfBuffer.byteLength} bytes`);

      // Text-Layer Sniff (skip if force OCR is enabled)
      let image_only = forceOcrRequest || forceOcr;
      let confidence = 0.8;
      let rationale = '';

      if (forceOcrRequest || forceOcr) {
        console.log('🔄 Force OCR enabled, skipping text-layer sniff');
        rationale = 'Force OCR requested, skipping text detection';
      } else {
        console.log('🔍 Analyzing PDF type (text vs image-based)...');
        
        try {
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
            console.warn('Type analysis failed, defaulting to OCR for safety');
            image_only = true;
            confidence = 0.3;
            rationale = 'Type analysis failed, defaulting to OCR extraction';
          } else {
            const typeData = await typeAnalysisResponse.json();
            const analysisResult = JSON.parse(typeData.choices[0]?.message?.content || '{"image_only": true, "confidence": 0.5, "rationale": "default to OCR"}');
            ({ image_only, confidence, rationale } = analysisResult);
          }
        } catch (error) {
          console.warn('Type analysis error, defaulting to OCR:', error);
          image_only = true;
          confidence = 0.3;
          rationale = 'Type analysis error, defaulting to OCR extraction';
        }
      }

      console.log(`📊 Document type analysis: image_only=${image_only}, confidence=${confidence}, rationale=${rationale}`);

      let extractedText = '';
      let pages: Array<{page: number, text: string}> = [];
      let extractionMethod = '';

      try {
        if (image_only) {
          // OCR Extractor for scanned/outlined CAD sheets
          console.log(`🖼️ Using OCR extraction (${ocrEngine}) for image-based PDF...`);
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
            return new Response(
              JSON.stringify({
                ok: false,
                phase: 'ocr',
                hint: 'OCR extraction failed. Try re-uploading the document or check if it\'s a valid PDF.',
                error: `OCR API returned ${ocrResponse.status}`,
                meta: { document_id }
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
        } else {
          // Text Extractor for text-based PDFs - with OCR fallback
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
            
            // Check if we got meaningful text - if not, fallback to OCR
            if (extractedText.trim().length < 10) {
              console.log('⚠️ Text extraction yielded minimal content, falling back to OCR...');
              image_only = true;
              extractionMethod = 'ocr-fallback';
              
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
                console.log(`✅ OCR fallback completed: ${extractedText.length} characters`);
              }
            }
          } else {
            return new Response(
              JSON.stringify({
                ok: false,
                phase: 'extract',
                hint: 'Text extraction failed. Try using Force OCR option.',
                error: `Text extraction API returned ${textResponse.status}`,
                meta: { document_id }
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            phase: image_only ? 'ocr' : 'extract',
            hint: 'Extraction process failed. Check if the PDF is valid and try again.',
            error: error.message,
            meta: { document_id, extractionMethod }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate AI summary and analysis
      console.log('🤖 Generating AI summary and analysis...');
      let aiSummary = 'Document processed successfully';
      
      try {
        if (extractedText && extractedText.trim().length > 10) {
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

          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            aiSummary = summaryData.choices[0]?.message?.content || aiSummary;
          } else {
            console.warn('AI summary generation failed, using default');
          }
        }
      } catch (error) {
        console.warn('AI summary error:', error);
        aiSummary = 'Document processed successfully (summary generation failed)';
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
          processed_at: new Date().toISOString(),
          force_ocr_used: forceOcrRequest || forceOcr,
          ocr_engine: ocrEngine
        }
      };

      // Update database with results
      try {
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
          return new Response(
            JSON.stringify({
              ok: false,
              phase: 'database',
              hint: 'Document was processed but failed to save results. Try processing again.',
              error: updateError.message,
              meta: { document_id }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Database update exception:', error);
        return new Response(
          JSON.stringify({
            ok: false,
            phase: 'database',
            hint: 'Document was processed but failed to save results. Check database connectivity.',
            error: error.message,
            meta: { document_id }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Document processing completed successfully');

      return new Response(
        JSON.stringify({
          ok: true,
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
          ok: false,
          phase: 'unknown',
          hint: 'An unexpected error occurred during processing. Please try again.',
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
  }

  // Handle unknown routes
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'Unknown endpoint',
      hint: 'Use POST /extract, GET /health, or POST /debug/fetch'
    }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});