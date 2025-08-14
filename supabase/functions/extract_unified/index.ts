// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type UnifiedResult = {
  document_type: "contract" | "drawing" | "spec" | "invoice" | "other";
  ai_summary: string;
  ai_confidence: number; // 0..1
  contract?: {
    title?: string;
    parties?: string[];
    effective_date?: string;
    expiry_date?: string;
    contract_value?: string;
    payment_terms?: string;
    scope_of_work?: string;
    termination_clause?: string;
    special_conditions?: string;
  };
  drawing?: {
    drawing_number?: string;
    revision?: string;
    project_name?: string;
    client_name?: string;
    architect?: string;
    scale?: string;
    discipline?: string;
    drawing_type?: string;
  };
  invoice?: {
    invoice_number?: string;
    invoice_date?: string;
    due_date?: string;
    vendor?: string;
    client?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    line_items?: Array<{
      description: string;
      qty: number;
      rate: number;
      amount: number;
    }>;
  };
};

const UnifiedSchema = {
  name: "UnifiedDocumentExtraction",
  schema: {
    type: "object",
    properties: {
      document_type: {
        type: "string",
        enum: ["contract", "drawing", "spec", "invoice", "other"]
      },
      ai_summary: { type: "string" },
      ai_confidence: { type: "number", minimum: 0, maximum: 1 },
      contract: {
        type: "object",
        properties: {
          title: { type: "string" },
          parties: { type: "array", items: { type: "string" } },
          effective_date: { type: "string" },
          expiry_date: { type: "string" },
          contract_value: { type: "string" },
          payment_terms: { type: "string" },
          scope_of_work: { type: "string" },
          termination_clause: { type: "string" },
          special_conditions: { type: "string" }
        }
      },
      drawing: {
        type: "object",
        properties: {
          drawing_number: { type: "string" },
          revision: { type: "string" },
          project_name: { type: "string" },
          client_name: { type: "string" },
          architect: { type: "string" },
          scale: { type: "string" },
          discipline: { type: "string" },
          drawing_type: { type: "string" }
        }
      },
      invoice: {
        type: "object",
        properties: {
          invoice_number: { type: "string" },
          invoice_date: { type: "string" },
          due_date: { type: "string" },
          vendor: { type: "string" },
          client: { type: "string" },
          subtotal: { type: "number" },
          tax: { type: "number" },
          total: { type: "number" },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                qty: { type: "number" },
                rate: { type: "number" },
                amount: { type: "number" }
              }
            }
          }
        }
      }
    },
    required: ["document_type", "ai_summary", "ai_confidence"]
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart text preprocessing to reduce token count
function preprocessText(text: string, maxTokens: number = 100000): string {
  // Remove repetitive patterns that inflate token count
  let processed = text
    // Remove excessive whitespace and newlines
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remove repetitive headers/footers
    .replace(/^(.*?)\n\1+$/gm, '$1')
    // Remove page numbers and common PDF artifacts
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\f/g, ' ')
    // Remove excessive punctuation
    .replace(/\.{3,}/g, '...')
    .replace(/-{3,}/g, '---')
    .trim();

  // If still too large, intelligently chunk by sections
  if (processed.length > maxTokens * 4) { // Rough token estimation
    const sections = processed.split(/\n\s*\n/);
    const importantSections = sections.filter(section => {
      const keywords = [
        'contract', 'agreement', 'party', 'parties', 'effective', 'termination',
        'payment', 'scope', 'work', 'value', 'amount', 'total', 'invoice',
        'drawing', 'revision', 'project', 'architect', 'scale', 'discipline'
      ];
      return keywords.some(keyword => 
        section.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    // Take first 10 important sections plus first 5 regular sections
    const selectedSections = [
      ...importantSections.slice(0, 10),
      ...sections.slice(0, 5)
    ];
    
    processed = [...new Set(selectedSections)].join('\n\n');
  }

  return processed;
}

// Enhanced PDF text extraction with intelligent preprocessing
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    // Method 1: Try PDF.js via CDN import
    try {
      const pdfjsLib = await import("https://esm.sh/pdfjs-dist@3.11.174");
      
      // Initialize worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(pdfBytes));
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // For large documents, prioritize key pages (first 5, last 2, and middle pages)
      const totalPages = pdf.numPages;
      const pagesToExtract = new Set<number>();
      
      // Always include first 5 pages (cover, TOC, key info)
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        pagesToExtract.add(i);
      }
      
      // Include last 2 pages (signatures, appendices)
      for (let i = Math.max(1, totalPages - 1); i <= totalPages; i++) {
        pagesToExtract.add(i);
      }
      
      // Include some middle pages for large documents
      if (totalPages > 10) {
        const middleStart = Math.floor(totalPages * 0.3);
        const middleEnd = Math.floor(totalPages * 0.7);
        for (let i = middleStart; i <= Math.min(middleEnd, middleStart + 3); i++) {
          pagesToExtract.add(i);
        }
      }
      
      // Extract text from selected pages
      const sortedPages = Array.from(pagesToExtract).sort((a, b) => a - b);
      
      for (const pageNum of sortedPages) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim())
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }
      
      if (fullText.trim()) {
        console.log("PDF.js extraction successful, pages extracted:", sortedPages.length);
        return preprocessText(cleanExtractedText(fullText));
      }
    } catch (pdfJsError) {
      console.warn("PDF.js extraction failed:", pdfJsError);
    }
    
    // Method 2: Fallback to manual text pattern extraction
    console.log("Using fallback text extraction method");
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(pdfBytes);
    
    // Enhanced pattern matching for PDF text extraction
    const patterns = [
      // Standard PDF text objects
      /BT\s+(.*?)\s+ET/gs,
      // Stream content
      /stream\s+(.*?)\s+endstream/gs,
      // Direct text patterns
      /\((.*?)\)/g,
      // Hex encoded text
      /<([0-9A-Fa-f\s]+)>/g
    ];
    
    let extractedText = '';
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Clean and decode the text
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
    console.error("All PDF text extraction methods failed:", error);
    return "PDF text extraction failed - document may be image-based or corrupted";
  }
}

// Clean and normalize extracted text
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove non-printable characters except newlines
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    // Clean up multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Clean up multiple newlines
    .replace(/\n+/g, '\n')
    // Trim whitespace
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.json();
    const { signed_url, file_url, project_contract_id } = body;

    console.log('Processing document extraction:', {
      file_url,
      signed_url,
      project_contract_id
    });

    // 1) Download file bytes (prefer signed_url if provided)
    const url = signed_url || file_url;
    const bytes = await fetchAsArrayBuffer(url);

    console.log('Downloaded file, size:', bytes.byteLength);

    // 2) Extract text from PDF
    const extractedText = await extractTextFromPDF(bytes);
    console.log('Extracted text length:', extractedText.length);

    // 3) Call OpenAI Chat Completions API with extracted text
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
        body: JSON.stringify({
          model: "gpt-4o-2024-11-20", // Latest model with 128K context window
          messages: [
            {
              role: "system",
              content: "You are an expert AI specialized in extracting structured data from construction industry documents including contracts, architectural drawings, specifications, and invoices. " +
                "You have deep knowledge of construction terminology, standard contract formats (AIA, FIDIC, NEC), architectural drawing conventions, and billing practices. " +
                "You excel at processing large documents by focusing on the most relevant sections first. " +
                
                "\n\nDOCUMENT PROCESSING STRATEGY:\n" +
                "For large documents, prioritize extraction from these sections in order:\n" +
                "1. Document headers and title pages\n" +
                "2. Signature pages and party information\n" +
                "3. Terms and conditions sections\n" +
                "4. Financial and payment information\n" +
                "5. Scope of work and deliverables\n" +
                "6. Drawing title blocks and revision information\n" +
                
                "\n\nEXAMPLE EXTRACTIONS:\n" +
                
                "CONTRACT EXAMPLE:\n" +
                "Input: 'CONSTRUCTION AGREEMENT between ABC Construction LLC and XYZ Development Corp. Contract Value: $2,450,000. Start Date: March 15, 2024. Completion: December 31, 2024. Payment Terms: Net 30 days.'\n" +
                "Output: {\"document_type\": \"contract\", \"ai_confidence\": 0.95, \"ai_summary\": \"Construction agreement between ABC Construction and XYZ Development for $2.45M project from March to December 2024\", \"contract\": {\"title\": \"Construction Agreement\", \"parties\": [\"ABC Construction LLC\", \"XYZ Development Corp\"], \"effective_date\": \"2024-03-15\", \"expiry_date\": \"2024-12-31\", \"contract_value\": \"$2,450,000\", \"payment_terms\": \"Net 30 days\"}}\n" +
                
                "DRAWING EXAMPLE:\n" +
                "Input: 'Drawing No: A-101 Rev: C Project: Downtown Office Tower Client: Metro Properties Architect: Smith & Associates Scale: 1/8\"=1'-0\" Discipline: Architectural Drawing Type: Floor Plan'\n" +
                "Output: {\"document_type\": \"drawing\", \"ai_confidence\": 0.92, \"ai_summary\": \"Architectural floor plan A-101 Rev C for Downtown Office Tower project by Smith & Associates\", \"drawing\": {\"drawing_number\": \"A-101\", \"revision\": \"C\", \"project_name\": \"Downtown Office Tower\", \"client_name\": \"Metro Properties\", \"architect\": \"Smith & Associates\", \"scale\": \"1/8\\\"=1'-0\\\"\", \"discipline\": \"Architectural\", \"drawing_type\": \"Floor Plan\"}}\n" +
                
                "INVOICE EXAMPLE:\n" +
                "Input: 'INVOICE #INV-2024-001 Date: 2024-02-15 Due: 2024-03-15 From: BuildCorp Inc To: Property Developers Ltd Subtotal: $15,000 Tax: $1,950 Total: $16,950'\n" +
                "Output: {\"document_type\": \"invoice\", \"ai_confidence\": 0.94, \"ai_summary\": \"Invoice INV-2024-001 from BuildCorp to Property Developers for $16,950 due March 15, 2024\", \"invoice\": {\"invoice_number\": \"INV-2024-001\", \"invoice_date\": \"2024-02-15\", \"due_date\": \"2024-03-15\", \"vendor\": \"BuildCorp Inc\", \"client\": \"Property Developers Ltd\", \"subtotal\": 15000, \"tax\": 1950, \"total\": 16950}}\n" +
                
                "\nCONFIDENCE SCORING GUIDELINES:\n" +
                "0.9-1.0: All key information clearly present, professional formatting, industry-standard terminology\n" +
                "0.7-0.8: Most information available, minor formatting issues, some unclear sections\n" +
                "0.5-0.6: Partial information extractable, significant formatting problems, missing key details\n" +
                "0.3-0.4: Poor text quality, fragmented content, but document type identifiable\n" +
                "0.0-0.2: Severely corrupted text, minimal extractable information\n" +
                
                "\nEXTRACTION RULES:\n" +
                "- Extract only explicitly stated information, never infer or assume\n" +
                "- For dates: Use ISO format (YYYY-MM-DD) when possible\n" +
                "- For monetary values: Include currency symbols and commas as shown\n" +
                "- For company names: Extract full legal names including LLC, Inc, Corp suffixes\n" +
                "- For technical specifications: Preserve exact formatting and units\n" +
                "- If information is unclear or missing, omit the field rather than guess\n" +
                "- Focus on the most important sections first if document is very large\n" +
                
                "Return ONLY valid JSON matching the schema."
          },
          {
            role: "user",
            content: `Extract structured data from this construction document text:

${extractedText}

IMPORTANT INSTRUCTIONS:
1. Document Classification: Identify if this is a contract, architectural drawing, specification, invoice, or other document type
2. Data Extraction: Extract specific fields relevant to the document type:
   - CONTRACTS: Focus on parties, dates, values, payment terms, scope of work, special conditions
   - DRAWINGS: Look for drawing numbers, revisions, project info, discipline, scale, architect details
   - INVOICES: Extract numbers, dates, vendor/client info, line items, totals
   - SPECIFICATIONS: Identify section numbers, materials, standards, requirements
3. Quality Assessment: Set confidence based on text clarity and completeness
4. Summary: Provide a concise 2-3 sentence summary of the document's purpose and key details

Text quality indicators:
- High confidence: Clear formatting, complete sentences, standard terminology
- Medium confidence: Some formatting issues but readable content
- Low confidence: Fragmented text, missing sections, unclear content

Return only the JSON matching the schema.`
          }
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: UnifiedSchema 
        },
        max_tokens: 4000, // Increased for better extraction detail
        temperature: 0.1
      })
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      console.error('OpenAI Chat Completions API failed:', completion.status, errorText);
      return new Response(errorText, { 
        status: completion.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const completionData = await completion.json();
    console.log('OpenAI API response received');
    
    const messageContent = completionData?.choices?.[0]?.message?.content;
    
    if (!messageContent) {
      throw new Error("No structured output from model");
    }

    const data = JSON.parse(messageContent) as UnifiedResult;

    // Enhanced validation and retry strategy based on document size and confidence
    const textLength = extractedText.length;
    const shouldRetry = data.ai_confidence < 0.4 || 
                       (textLength > 500000 && data.ai_confidence < 0.6);

    if (shouldRetry) {
      console.warn(`Low confidence extraction (${data.ai_confidence}), attempting enhanced retry. Text length: ${textLength}`);
      
      // For very large documents, try a two-pass approach
      if (textLength > 300000) {
        console.log('Attempting two-pass extraction for large document');
        
        // First pass: Document type identification
        const typeIdentificationCompletion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-11-20",
            messages: [
              {
                role: "system",
                content: "You are a document classifier. Your only job is to identify the document type and provide a brief summary. " +
                  "Look for key indicators: CONTRACT (agreements, terms, parties), DRAWING (plans, elevations, details), " +
                  "INVOICE (billing, payments, line items), SPEC (specifications, requirements)."
              },
              {
                role: "user",
                content: `Classify this document and provide a brief summary. Focus on the first few pages:

${extractedText.substring(0, 50000)}

Identify: document type, key parties/companies, main purpose, and confidence level.`
              }
            ],
            response_format: { 
              type: "json_schema", 
              json_schema: UnifiedSchema 
            },
            max_tokens: 1000,
            temperature: 0.1
          })
        });

        if (typeIdentificationCompletion.ok) {
          const typeData = await typeIdentificationCompletion.json();
          const typeContent = typeData?.choices?.[0]?.message?.content;
          if (typeContent) {
            const typeResult = JSON.parse(typeContent) as UnifiedResult;
            
            // Second pass: Detailed extraction based on identified type
            const detailedPrompt = typeResult.document_type === 'contract' 
              ? "Focus on extracting: contract title, parties, dates, financial terms, scope of work, payment terms, and special conditions."
              : typeResult.document_type === 'drawing'
              ? "Focus on extracting: drawing number, revision, project name, architect, scale, discipline, and drawing type."
              : typeResult.document_type === 'invoice'
              ? "Focus on extracting: invoice number, dates, vendor/client info, line items, and financial totals."
              : "Extract key document information based on the document type identified.";

            const detailedCompletion = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "gpt-4o-2024-11-20",
                messages: [
                  {
                    role: "system",
                    content: `You are extracting detailed information from a ${typeResult.document_type} document. ${detailedPrompt} ` +
                      "Be thorough but focus on the most important information first."
                  },
                  {
                    role: "user",
                    content: `Extract detailed information from this ${typeResult.document_type}:

${extractedText}

${detailedPrompt}`
                  }
                ],
                response_format: { 
                  type: "json_schema", 
                  json_schema: UnifiedSchema 
                },
                max_tokens: 4000,
                temperature: 0.1
              })
            });

            if (detailedCompletion.ok) {
              const detailedData = await detailedCompletion.json();
              const detailedContent = detailedData?.choices?.[0]?.message?.content;
              if (detailedContent) {
                const detailedResult = JSON.parse(detailedContent) as UnifiedResult;
                console.log('Two-pass extraction completed');
                Object.assign(data, detailedResult);
              }
            }
          }
        }
      } else {
        // Single retry for smaller documents
        const retryCompletion = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-11-20",
            messages: [
              {
                role: "system",
                content: "You are analyzing a construction document that may have text extraction issues. " +
                  "Focus on finding readable fragments and key information patterns. " +
                  "Look for: headers, signatures, dates, amounts, company names, and technical identifiers. " +
                  "Use conservative confidence scoring based on text clarity."
              },
              {
                role: "user",
                content: `Extract information from this construction document text:

${extractedText}

Key focus areas:
- Document identifiers and numbers
- Company/party names and contacts
- Critical dates and deadlines
- Financial information and amounts
- Technical specifications or drawing details
- Legal terms and conditions

Provide appropriate confidence based on text quality and completeness.`
              }
            ],
            response_format: { 
              type: "json_schema", 
              json_schema: UnifiedSchema 
            },
            max_tokens: 4000,
            temperature: 0.1
          })
        });

        if (retryCompletion.ok) {
          const retryData = await retryCompletion.json();
          const retryContent = retryData?.choices?.[0]?.message?.content;
          if (retryContent) {
            const retryResult = JSON.parse(retryContent) as UnifiedResult;
            console.log('Enhanced retry extraction completed');
            Object.assign(data, retryResult);
          }
        }
      }
    }

    console.log('AI extraction complete:', { 
      document_type: data.document_type, 
      confidence: data.ai_confidence, 
      summary_length: data.ai_summary?.length || 0,
      extracted_text_length: extractedText.length
    });

    // 4) Update the project_contracts table with the extracted data
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const updateData: any = {
      ai_summary_json: data.ai_summary,
      confidence: data.ai_confidence,
      contract_data: data,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('project_contracts')
      .update(updateData)
      .eq('id', project_contract_id);

    if (updateError) {
      console.error('Failed to update project_contracts:', updateError);
      throw updateError;
    }

    console.log('Updated project_contracts table for contract ID:', project_contract_id);

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in extract_unified function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});