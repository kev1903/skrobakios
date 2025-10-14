import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import pdfParse from "npm:pdf-parse@1.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, companyId, documentId } = await req.json();
    
    console.log("Received analysis request:", { projectId, companyId, documentId });

    if (!projectId || !documentId) {
      return new Response(
        JSON.stringify({ error: "projectId and documentId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to processing
    await supabase
      .from("project_documents")
      .update({ processing_status: 'processing' })
      .eq("id", documentId);

    console.log("Fetching document:", documentId);

    // Fetch the document
    const { data: document, error: docError } = await supabase
      .from("project_documents")
      .select("*, category:document_categories(id, name, ai_prompt, ai_instructions, ai_guardrails, ai_framework)")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract category configuration
    const categoryConfig = Array.isArray(document.category) ? document.category[0] : document.category;
    if (categoryConfig) {
      console.log("Using category-specific AI config for:", categoryConfig.name);
    }

    console.log("Document found:", document.name, "Type:", document.content_type);

    let extractedText = document.extracted_text;

    // Extract text from PDF if not already extracted (with size limits)
    if (!extractedText && document.content_type === 'application/pdf') {
      const maxFileSize = 5 * 1024 * 1024; // 5MB limit for text extraction
      
      if (document.file_size && document.file_size > maxFileSize) {
        console.log(`PDF too large for text extraction (${Math.round(document.file_size / 1024 / 1024)}MB), skipping...`);
        // Continue without text extraction for large files
      } else {
        console.log("Extracting text from PDF...");
        
        try {
          // Download the PDF file
          const pdfResponse = await fetch(document.file_url);
          if (!pdfResponse.ok) {
            throw new Error('Failed to download PDF');
          }
          const pdfBuffer = await pdfResponse.arrayBuffer();
          
          console.log(`PDF downloaded (${Math.round(pdfBuffer.byteLength / 1024)}KB), extracting text...`);
          
          // Extract text using pdf-parse (pass Uint8Array directly)
          const pdfData = await pdfParse(new Uint8Array(pdfBuffer));
          extractedText = pdfData.text;
          
          console.log(`Text extracted: ${extractedText.length} characters from ${pdfData.numpages} pages`);
          
          // Store extracted text in database for future use
          await supabase
            .from("project_documents")
            .update({ extracted_text: extractedText })
            .eq("id", documentId);
            
        } catch (pdfError) {
          console.error("Error extracting PDF text:", pdfError);
          // Continue without extracted text - AI will analyze based on metadata
        }
      }
    }

    console.log("Analyzing document with SkAi...");

    // Prepare the prompt for AI analysis using category-specific configuration
    let systemPrompt = '';
    
    if (categoryConfig?.ai_prompt) {
      // Use category-specific prompt
      systemPrompt = categoryConfig.ai_prompt;
      
      // Append additional category configuration
      if (categoryConfig.ai_instructions) {
        systemPrompt += `\n\n## Instructions:\n${categoryConfig.ai_instructions}`;
      }
      
      if (categoryConfig.ai_guardrails) {
        systemPrompt += `\n\n## Guardrails:\n${categoryConfig.ai_guardrails}`;
      }
      
      if (categoryConfig.ai_framework) {
        systemPrompt += `\n\n## Framework:\n${categoryConfig.ai_framework}`;
      }
    } else {
      // Default prompt if no category config
      systemPrompt = `You are SkAi, an expert construction project document analyst. Analyze the provided document and extract key information including:
- Document type and purpose
- Key findings and important details
- Potential risks or issues identified
- Recommendations or action items
- Relevant dates, costs, or quantities mentioned

Provide a comprehensive but concise summary (max 500 words) that would be useful for project management.`;
    }

    const userPrompt = `Analyze this construction project document:

Document Name: ${document.name}
Document Type: ${document.document_type || 'Unknown'}
File Type: ${document.content_type || 'Unknown'}
File Size: ${document.file_size ? `${Math.round(document.file_size / 1024 / 1024)}MB` : 'Unknown'}
${categoryConfig ? `Category: ${categoryConfig.name}` : ''}

${extractedText ? `Document Content:\n${extractedText.substring(0, 10000)}` : 'Note: This is a large PDF file. Please analyze based on the document name, type, and construction project management best practices. Extract comprehensive scope data including spaces, construction elements, materials, openings, services, external works, and compliance requirements based on typical architectural drawing standards.'}

Please provide detailed scope extraction focusing on construction project management aspects. Extract all measurable quantities, materials, and specifications that can be identified.`;

    console.log("Calling Lovable AI for comprehensive scope extraction...");

    // Define comprehensive scope extraction tool
    const scopeExtractionTool = {
      type: "function",
      function: {
        name: "extract_construction_scope",
        description: "Extract comprehensive construction scope data from the document including spaces, materials, elements, and compliance information",
        parameters: {
          type: "object",
          properties: {
            drawing_info: {
              type: "object",
              properties: {
                type: { type: "string", description: "Drawing type (floor plan, elevation, section, detail, etc.)" },
                scale: { type: "string", description: "Drawing scale" },
                level: { type: "string", description: "Building level or floor" },
                discipline: { type: "string", description: "Discipline (architectural, structural, mechanical, etc.)" }
              }
            },
            spaces: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  area_sqm: { type: "number" },
                  floor_level: { type: "string" },
                  ceiling_height_m: { type: "number" },
                  function: { type: "string" }
                },
                required: ["name"]
              }
            },
            construction_scope: {
              type: "array",
              description: "Bill of quantities items extracted from the document",
              items: {
                type: "object",
                properties: {
                  category: { type: "string", description: "Category (walls, doors, windows, finishes, etc.)" },
                  item_code: { type: "string" },
                  description: { type: "string" },
                  unit: { type: "string", description: "Unit of measure (m, m2, m3, nr, etc.)" },
                  quantity: { type: "number" },
                  location: { type: "string" },
                  specification: { type: "string" },
                  material: { type: "string" },
                  finish: { type: "string" }
                },
                required: ["category", "description", "unit", "quantity"]
              }
            },
            openings: {
              type: "array",
              description: "Doors and windows schedule",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["door", "window"] },
                  mark: { type: "string" },
                  width_mm: { type: "number" },
                  height_mm: { type: "number" },
                  material: { type: "string" },
                  finish: { type: "string" },
                  location: { type: "string" },
                  quantity: { type: "number" }
                },
                required: ["type", "mark"]
              }
            },
            services: {
              type: "array",
              description: "MEP and services information",
              items: {
                type: "object",
                properties: {
                  system: { type: "string", description: "electrical, plumbing, hvac, fire, etc." },
                  description: { type: "string" },
                  location: { type: "string" },
                  specification: { type: "string" }
                }
              }
            },
            external_works: {
              type: "array",
              description: "External and site works",
              items: {
                type: "object",
                properties: {
                  element: { type: "string", description: "paving, fencing, landscaping, drainage, etc." },
                  description: { type: "string" },
                  area_or_length: { type: "number" },
                  unit: { type: "string" },
                  material: { type: "string" }
                }
              }
            },
            compliance: {
              type: "object",
              properties: {
                building_code_references: { type: "array", items: { type: "string" } },
                accessibility_features: { type: "array", items: { type: "string" } },
                fire_safety_elements: { type: "array", items: { type: "string" } },
                environmental_considerations: { type: "array", items: { type: "string" } }
              }
            }
          },
          required: ["construction_scope"]
        }
      }
    };

    // Call Lovable AI with scope extraction tool
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [scopeExtractionTool],
        tool_choice: { type: "function", function: { name: "extract_construction_scope" } },
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      // Update status to failed
      await supabase
        .from("project_documents")
        .update({ processing_status: 'failed', error_message: errorText })
        .eq("id", documentId);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI analysis failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const aiSummary = aiResult.choices?.[0]?.message?.content;

    if (!aiSummary) {
      console.error("No analysis generated from AI");
      await supabase
        .from("project_documents")
        .update({ processing_status: 'failed', error_message: 'No analysis generated' })
        .eq("id", documentId);
      
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI analysis completed, updating document...");

    // Prepare update object
    const updateData: any = {
      ai_summary: aiSummary,
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    };

    // Extract structured scope data from tool calling
    const message = aiResult.choices[0].message;
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function?.name === 'extract_construction_scope') {
        try {
          const structuredData = JSON.parse(toolCall.function.arguments);
          console.log('Extracted comprehensive scope data:', {
            drawing_type: structuredData?.drawing_info?.type,
            spaces_count: structuredData?.spaces?.length || 0,
            scope_items_count: structuredData?.construction_scope?.length || 0,
            openings_count: structuredData?.openings?.length || 0,
            services_count: structuredData?.services?.length || 0,
            external_works_count: structuredData?.external_works?.length || 0,
            has_compliance: !!structuredData?.compliance
          });
          
          // Store comprehensive structured data in metadata field
          updateData.metadata = structuredData;
        } catch (parseError) {
          console.error('Failed to parse structured scope data:', parseError);
        }
      }
    }

    // Update the document with AI summary and optional structured data
    const { error: updateError } = await supabase
      .from("project_documents")
      .update(updateData)
      .eq("id", documentId);

    if (updateError) {
      console.error("Error updating document:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Document analysis completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        summary: aiSummary,
        hasExtractedText: !!extractedText,
        message: "Document analysis completed successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sync-project-knowledge:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
