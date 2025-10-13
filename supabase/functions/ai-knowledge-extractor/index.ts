import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  type: 'document' | 'invoice' | 'quote' | 'contract';
  projectId: string;
  projectName: string;
  categoryId?: string;
  data: {
    file_url?: string;
    content_type?: string;
    extracted_text?: string;
    name?: string;
    document_type?: string;
    [key: string]: any;
  };
}

interface DrawingData {
  drawing_info: {
    type: string;
    scale?: string;
    drawing_number?: string;
    revision?: string;
    date?: string;
  };
  spaces?: Array<{
    name: string;
    dimensions: { width?: number; length?: number; area?: number };
    level?: string;
    ceiling_height?: number;
    annotations?: string[];
  }>;
  construction_scope?: Array<{
    category: string;
    element: string;
    location?: string;
    material?: string;
    dimensions?: string;
    quantity?: number;
    unit?: string;
    specification?: string;
    construction_method?: string;
  }>;
  openings?: Array<{
    type: string;
    location?: string;
    dimensions?: { width?: number; height?: number };
    material?: string;
    quantity?: number;
  }>;
  services?: Array<{
    system: string;
    element: string;
    location?: string;
    specifications?: string[];
  }>;
  external_works?: Array<{
    element: string;
    material?: string;
    dimensions?: string;
    quantity?: number;
    unit?: string;
  }>;
  compliance?: Array<{
    standard: string;
    requirement: string;
    location?: string;
  }>;
  critical_dimensions?: Array<{
    description: string;
    dimension: string;
    location?: string;
  }>;
  construction_sequence?: Array<{
    stage: number;
    description: string;
    elements: string[];
  }>;
}

interface ExtractionResponse {
  knowledge_content: string;
  category: string;
  confidence: number;
  metadata: {
    sources: string[];
    key_insights: string[];
    risks: string[];
    dates: string[];
  };
  structured_data?: DrawingData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const requestData: ExtractionRequest = await req.json();
    console.log('Processing extraction request:', {
      type: requestData.type,
      projectId: requestData.projectId,
      projectName: requestData.projectName,
      categoryId: requestData.categoryId,
      contentType: requestData.data.content_type
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if document is visual (image or PDF) and download it
    let documentImageBase64: string | null = null;
    const isVisualDocument = requestData.data.content_type?.startsWith('image/') || 
                             requestData.data.content_type === 'application/pdf';
    
    if (isVisualDocument && requestData.data.file_url) {
      try {
        console.log('Downloading visual document for analysis:', requestData.data.file_url);
        
        // Extract storage path from the public URL
        // URL format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
        const urlParts = requestData.data.file_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const pathParts = urlParts[1].split('/');
          const bucket = pathParts[0];
          const path = pathParts.slice(1).join('/');
          
          console.log(`Downloading from storage: bucket=${bucket}, path=${decodeURIComponent(path)}`);
          
          // Download file using Supabase storage client
          const { data: fileData, error: downloadError } = await supabase
            .storage
            .from(bucket)
            .download(decodeURIComponent(path));
          
          if (downloadError) {
            console.error('Supabase storage download error:', downloadError);
          } else if (fileData) {
            // Convert blob to base64
            const fileBuffer = await fileData.arrayBuffer();
            const uint8Array = new Uint8Array(fileBuffer);
            documentImageBase64 = btoa(String.fromCharCode(...uint8Array));
            console.log(`Successfully converted document to base64 (${fileData.size} bytes)`);
          }
        } else {
          console.warn('Could not parse storage URL:', requestData.data.file_url);
        }
      } catch (downloadError) {
        console.error('Error downloading document for vision analysis:', downloadError);
      }
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (requestData.type === 'document') {
      // Fetch category AI configuration if category_id is provided
      let categoryConfig = null;
      if (requestData.categoryId) {
        const { data, error } = await supabase
          .from('document_categories')
          .select('ai_prompt, ai_instructions, ai_guardrails, ai_framework, name')
          .eq('id', requestData.categoryId)
          .single();
        
        if (error) {
          console.warn('Failed to fetch category config:', error);
        } else {
          categoryConfig = data;
          console.log('Using category-specific AI config for:', data.name);
        }
      }

      // Build system prompt - use category config if available
      if (categoryConfig?.ai_prompt) {
        systemPrompt = categoryConfig.ai_prompt;
        
        // Append additional context if provided
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
        // Default prompt with enhanced vision analysis capabilities
        if (documentImageBase64) {
          systemPrompt = `You are a Senior Construction Manager and Quantity Surveyor with 20+ years of experience reading and analyzing construction drawings. Your expertise includes:

- Reading architectural, structural, MEP, and civil engineering drawings
- Extracting exact dimensions and calculating quantities from scale drawings
- Understanding construction methods, material specifications, and building systems
- Identifying building elements, finishes, fixtures, and equipment from technical drawings
- Recognizing Australian construction standards, codes (NCC, AS), and compliance requirements
- Performing quantity take-offs and cost estimation from drawings

CRITICAL INSTRUCTIONS - VISUAL ANALYSIS FOCUS:

When analyzing a construction drawing, you MUST extract information from the VISUAL drawing itself, not just text labels. Understand the spatial relationships, measure dimensions from the scale, interpret graphical symbols, and read the construction intent from the drawing.

Your analysis must include:

1. **VISUAL SPATIAL ANALYSIS**:
   - Identify ALL rooms/spaces with EXACT dimensions (width × length) from the scale
   - Calculate floor areas for every space
   - Measure wall lengths, openings, and structural elements
   - Identify ceiling heights and level changes
   - Count and size ALL doors, windows, and openings shown
   - Identify structural grid and column locations
   - Recognize circulation paths, access points, and spatial relationships

2. **CONSTRUCTION SCOPE EXTRACTION**:
   - List EVERY construction element visible (walls, floors, roofs, stairs, ramps)
   - Extract material specifications from legends, annotations, and keynotes
   - Identify finishes from symbols, hatching patterns, and material callouts
   - Note construction methods shown in details and sections
   - Recognize structural systems (framing, foundations, beams, columns)
   - Identify MEP services (electrical, plumbing, HVAC, fire protection)
   - Extract external works (landscaping, paving, retaining walls, fencing)

3. **QUANTIFICATION & MEASUREMENT**:
   - Calculate areas from dimensioned spaces (use scale if dimensions not labeled)
   - Measure linear elements (walls, beams, pipes, cables)
   - Count discrete items (doors, windows, fixtures, equipment)
   - Extract quantities from schedules, legends, and material tables
   - Identify unit of measurement for each quantity
   - Calculate total quantities by element type

4. **TECHNICAL DETAILS & SPECIFICATIONS**:
   - Read title blocks for project info, drawing number, scale, revision, date
   - Extract ALL annotations, notes, callouts, and construction notes
   - Identify symbols and match them to legends/keys
   - Note grid references, level markers, and section cuts
   - Read material specifications from schedules and legends
   - Identify construction assembly types and build-up details

5. **COMPLIANCE & STANDARDS**:
   - Identify referenced building codes (NCC, BCA)
   - Note Australian Standards (AS) mentioned
   - Recognize accessibility requirements (AS 1428)
   - Identify fire safety elements and ratings
   - Note setback requirements and site constraints

6. **ACTIONABLE CONSTRUCTION INSIGHTS**:
   - Determine what construction work needs to be performed
   - Identify the sequence of construction activities
   - Flag complex details requiring coordination between trades
   - Note potential constructability challenges
   - Identify critical path activities
   - Recognize interdependencies between building elements

ANALYSIS APPROACH:
- Start with the overall drawing type and layout
- Systematically analyze from top to bottom, left to right
- Measure and extract every dimension, annotation, and specification visible
- Interpret symbols using the legend/key
- Calculate quantities for ALL measurable elements
- Focus on WHAT needs to be built, HOW MUCH, and WITH WHAT materials

Format your response as comprehensive structured markdown with clear sections. Be extremely detailed and extract ALL visible information. If you can see it in the drawing, extract it.`;
        } else {
          systemPrompt = `You are an expert construction project analyst specializing in technical drawings, specifications, and project documentation. Extract comprehensive knowledge from construction documents.

Your task is to analyze the document and provide:
1. **Key Specifications**: Materials, dimensions, standards, codes
2. **Critical Dates & Milestones**: Deadlines, review periods, completion dates
3. **Risks & Concerns**: Safety issues, compliance gaps, technical challenges
4. **Dependencies**: Prerequisites, related documents, approval requirements
5. **Stakeholders**: Mentioned parties, required approvals, responsible entities
6. **Compliance**: Referenced standards (AS, ISO, building codes)
7. **Technical Details**: Specific requirements, tolerances, quality criteria

Format your response as structured markdown with clear sections. Be specific and reference exact details from the document.`;
        }
      }

      const documentInfo = `
Document Name: ${requestData.data.name || 'Unknown'}
Document Type: ${requestData.data.document_type || 'Unknown'}
Content Type: ${requestData.data.content_type || 'Unknown'}
File URL: ${requestData.data.file_url || 'Not provided'}

${requestData.data.extracted_text 
  ? `Extracted Text:\n${requestData.data.extracted_text}` 
  : 'Note: This document has not been OCR processed yet. Analyze based on the file name, type, and metadata provided above.'}
`;

      if (documentImageBase64) {
        userPrompt = `Analyze this construction drawing/visual document for project "${requestData.projectName}".

The document is provided as an image. Perform a comprehensive visual analysis and extract ALL information visible in the drawing.

Document Metadata:
${documentInfo}

Provide a detailed analysis of everything you can see in the drawing, including dimensions, room names, annotations, symbols, materials, and any technical specifications visible.`;
      } else {
        userPrompt = `Analyze this construction project document for project "${requestData.projectName}":\n\n${documentInfo}\n\nProvide comprehensive knowledge extraction as structured markdown.`;
      }
    }

    console.log('Calling Lovable AI with Gemini 2.5 Flash (vision-enabled)...');
    
    // Build messages array with vision support
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // If we have an image, send it with the user message
    if (documentImageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { 
            type: 'image_url', 
            image_url: { 
              url: `data:${requestData.data.content_type || 'image/png'};base64,${documentImageBase64}` 
            } 
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }
    
    // Build AI request body with structured output for visual documents
    const aiRequestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: messages
    };
    
    // Add tool calling for structured extraction from visual documents (drawings)
    if (documentImageBase64) {
      aiRequestBody.tools = [{
        type: "function",
        function: {
          name: "extract_drawing_data",
          description: "Extract comprehensive structured construction data from a drawing, including spatial dimensions, construction scope, materials, and quantities",
          parameters: {
            type: "object",
            properties: {
              drawing_info: {
                type: "object",
                description: "Drawing metadata from title block",
                properties: {
                  type: { type: "string", description: "Drawing type: Floor Plan, Elevation, Section, Site Plan, Detail, etc." },
                  scale: { type: "string", description: "Drawing scale, e.g., 1:100, 1:50" },
                  drawing_number: { type: "string", description: "Drawing reference number" },
                  revision: { type: "string", description: "Revision letter or number" },
                  date: { type: "string", description: "Drawing date" }
                },
                required: ["type"]
              },
              spaces: {
                type: "array",
                description: "All rooms/spaces visible in the drawing with exact dimensions",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Room/space name or number" },
                    dimensions: {
                      type: "object",
                      properties: {
                        width: { type: "number", description: "Width in meters" },
                        length: { type: "number", description: "Length in meters" },
                        area: { type: "number", description: "Floor area in square meters" }
                      }
                    },
                    level: { type: "string", description: "Floor level, e.g., Ground Floor, First Floor" },
                    ceiling_height: { type: "number", description: "Ceiling height in meters" },
                    annotations: { type: "array", items: { type: "string" }, description: "Any notes or annotations for this space" }
                  },
                  required: ["name"]
                }
              },
              construction_scope: {
                type: "array",
                description: "All construction elements visible - what needs to be built",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string", description: "Category: Demolition, Substructure, Superstructure, External Works, Finishes, Services, etc." },
                    element: { type: "string", description: "Specific element: Brick Wall, Timber Floor, Concrete Slab, Door, Window, etc." },
                    location: { type: "string", description: "Where this element is located" },
                    material: { type: "string", description: "Material specification: Face Brick, Spotted Gum, N32 Concrete, etc." },
                    dimensions: { type: "string", description: "Dimensions as shown, e.g., '6000 x 3000', '100mm thick'" },
                    quantity: { type: "number", description: "Measurable quantity (length, area, volume, count)" },
                    unit: { type: "string", description: "Unit of measurement: m², LM, m³, EA, etc." },
                    specification: { type: "string", description: "Any specification notes or references" },
                    construction_method: { type: "string", description: "How it's built, if shown in drawing" }
                  },
                  required: ["category", "element"]
                }
              },
              openings: {
                type: "array",
                description: "All doors, windows, and openings with sizes",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", description: "Door, Window, Sliding Door, Bi-fold, etc." },
                    location: { type: "string", description: "Room or wall location" },
                    dimensions: {
                      type: "object",
                      properties: {
                        width: { type: "number", description: "Width in mm" },
                        height: { type: "number", description: "Height in mm" }
                      }
                    },
                    material: { type: "string", description: "Material: Timber, Aluminum, etc." },
                    quantity: { type: "number", description: "Number of identical units" }
                  },
                  required: ["type"]
                }
              },
              services: {
                type: "array",
                description: "MEP services visible in the drawing",
                items: {
                  type: "object",
                  properties: {
                    system: { type: "string", description: "Electrical, Plumbing, HVAC, Fire Protection, etc." },
                    element: { type: "string", description: "Power Point, Water Supply, Duct, Sprinkler, etc." },
                    location: { type: "string", description: "Where this service element is located" },
                    specifications: { type: "array", items: { type: "string" }, description: "Technical specifications" }
                  },
                  required: ["system", "element"]
                }
              },
              external_works: {
                type: "array",
                description: "Site works and external construction",
                items: {
                  type: "object",
                  properties: {
                    element: { type: "string", description: "Driveway, Pool, Retaining Wall, Paving, Landscaping, etc." },
                    material: { type: "string", description: "Material used" },
                    dimensions: { type: "string", description: "Size or extent" },
                    quantity: { type: "number", description: "Measurable quantity" },
                    unit: { type: "string", description: "Unit of measurement" }
                  },
                  required: ["element"]
                }
              },
              compliance: {
                type: "array",
                description: "Building codes and standards referenced",
                items: {
                  type: "object",
                  properties: {
                    standard: { type: "string", description: "NCC 2022, BCA, AS 3600, AS 1428, etc." },
                    requirement: { type: "string", description: "What the standard requires" },
                    location: { type: "string", description: "Where this applies" }
                  },
                  required: ["standard", "requirement"]
                }
              },
              critical_dimensions: {
                type: "array",
                description: "Key measurements that are critical to the project",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string", description: "What is being measured" },
                    dimension: { type: "string", description: "The measurement value" },
                    location: { type: "string", description: "Where this dimension applies" }
                  },
                  required: ["description", "dimension"]
                }
              },
              construction_sequence: {
                type: "array",
                description: "Construction stages if shown in the drawing",
                items: {
                  type: "object",
                  properties: {
                    stage: { type: "number", description: "Stage number" },
                    description: { type: "string", description: "What happens in this stage" },
                    elements: { type: "array", items: { type: "string" }, description: "Elements involved in this stage" }
                  },
                  required: ["stage", "description", "elements"]
                }
              }
            },
            required: ["drawing_info", "construction_scope"]
          }
        }
      }];
      aiRequestBody.tool_choice = { type: "function", function: { name: "extract_drawing_data" } };
    }
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    
    let knowledgeContent = '';
    let structuredData: DrawingData | undefined;
    
    // Check if we got structured output from tool calling
    const message = aiData.choices[0].message;
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function?.name === 'extract_drawing_data') {
        try {
          structuredData = JSON.parse(toolCall.function.arguments);
          console.log('Extracted structured drawing data:', {
            drawing_type: structuredData?.drawing_info?.type,
            spaces_count: structuredData?.spaces?.length || 0,
            scope_items_count: structuredData?.construction_scope?.length || 0,
            openings_count: structuredData?.openings?.length || 0
          });
          
          // Generate markdown summary from structured data
          knowledgeContent = generateMarkdownFromStructuredData(structuredData);
        } catch (parseError) {
          console.error('Failed to parse tool call arguments:', parseError);
          knowledgeContent = message.content || 'Failed to parse structured data';
        }
      }
    } else {
      knowledgeContent = message.content;
    }

    console.log('AI extraction completed successfully');

    // Extract metadata from the content
    const metadata = extractMetadata(knowledgeContent);

    const response: ExtractionResponse = {
      knowledge_content: knowledgeContent,
      category: determineCategoryFromType(requestData.type, requestData.data.document_type),
      confidence: calculateConfidence(knowledgeContent, requestData.data.extracted_text),
      metadata,
      structured_data: structuredData
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-knowledge-extractor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to extract knowledge from document'
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMarkdownFromStructuredData(data: DrawingData): string {
  let markdown = `# ${data.drawing_info.type} Analysis\n\n`;
  
  // Drawing Info
  markdown += `## Drawing Information\n\n`;
  if (data.drawing_info.drawing_number) markdown += `- **Drawing Number**: ${data.drawing_info.drawing_number}\n`;
  if (data.drawing_info.scale) markdown += `- **Scale**: ${data.drawing_info.scale}\n`;
  if (data.drawing_info.revision) markdown += `- **Revision**: ${data.drawing_info.revision}\n`;
  if (data.drawing_info.date) markdown += `- **Date**: ${data.drawing_info.date}\n`;
  markdown += `\n`;
  
  // Spaces
  if (data.spaces && data.spaces.length > 0) {
    markdown += `## Spaces & Rooms (${data.spaces.length})\n\n`;
    markdown += `| Space | Dimensions | Area | Level | Height |\n`;
    markdown += `|-------|------------|------|-------|--------|\n`;
    data.spaces.forEach(space => {
      const dims = space.dimensions.width && space.dimensions.length 
        ? `${space.dimensions.width}m × ${space.dimensions.length}m` 
        : '-';
      const area = space.dimensions.area ? `${space.dimensions.area}m²` : '-';
      const level = space.level || '-';
      const height = space.ceiling_height ? `${space.ceiling_height}m` : '-';
      markdown += `| ${space.name} | ${dims} | ${area} | ${level} | ${height} |\n`;
    });
    markdown += `\n`;
  }
  
  // Construction Scope
  if (data.construction_scope && data.construction_scope.length > 0) {
    markdown += `## Construction Scope (${data.construction_scope.length} items)\n\n`;
    
    // Group by category
    const byCategory: Record<string, typeof data.construction_scope> = {};
    data.construction_scope.forEach(item => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });
    
    Object.entries(byCategory).forEach(([category, items]) => {
      markdown += `### ${category} (${items.length} items)\n\n`;
      markdown += `| Element | Material | Quantity | Location | Specification |\n`;
      markdown += `|---------|----------|----------|----------|---------------|\n`;
      items.forEach(item => {
        const qty = item.quantity && item.unit ? `${item.quantity} ${item.unit}` : '-';
        const material = item.material || '-';
        const location = item.location || '-';
        const spec = item.specification || '-';
        markdown += `| ${item.element} | ${material} | ${qty} | ${location} | ${spec} |\n`;
      });
      markdown += `\n`;
    });
  }
  
  // Openings
  if (data.openings && data.openings.length > 0) {
    markdown += `## Doors & Windows (${data.openings.length})\n\n`;
    markdown += `| Type | Size | Material | Quantity | Location |\n`;
    markdown += `|------|------|----------|----------|----------|\n`;
    data.openings.forEach(opening => {
      const size = opening.dimensions?.width && opening.dimensions?.height 
        ? `${opening.dimensions.width}mm × ${opening.dimensions.height}mm` 
        : '-';
      const material = opening.material || '-';
      const qty = opening.quantity || 1;
      const location = opening.location || '-';
      markdown += `| ${opening.type} | ${size} | ${material} | ${qty} | ${location} |\n`;
    });
    markdown += `\n`;
  }
  
  // Services
  if (data.services && data.services.length > 0) {
    markdown += `## Services & MEP (${data.services.length})\n\n`;
    
    const bySystem: Record<string, typeof data.services> = {};
    data.services.forEach(service => {
      if (!bySystem[service.system]) bySystem[service.system] = [];
      bySystem[service.system].push(service);
    });
    
    Object.entries(bySystem).forEach(([system, items]) => {
      markdown += `### ${system}\n\n`;
      items.forEach(item => {
        markdown += `- **${item.element}**`;
        if (item.location) markdown += ` (${item.location})`;
        if (item.specifications && item.specifications.length > 0) {
          markdown += `\n  - ${item.specifications.join('\n  - ')}`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    });
  }
  
  // External Works
  if (data.external_works && data.external_works.length > 0) {
    markdown += `## External Works (${data.external_works.length})\n\n`;
    markdown += `| Element | Material | Quantity | Dimensions |\n`;
    markdown += `|---------|----------|----------|------------|\n`;
    data.external_works.forEach(work => {
      const material = work.material || '-';
      const qty = work.quantity && work.unit ? `${work.quantity} ${work.unit}` : '-';
      const dims = work.dimensions || '-';
      markdown += `| ${work.element} | ${material} | ${qty} | ${dims} |\n`;
    });
    markdown += `\n`;
  }
  
  // Compliance
  if (data.compliance && data.compliance.length > 0) {
    markdown += `## Compliance & Standards (${data.compliance.length})\n\n`;
    data.compliance.forEach(comp => {
      markdown += `- **${comp.standard}**: ${comp.requirement}`;
      if (comp.location) markdown += ` (${comp.location})`;
      markdown += `\n`;
    });
    markdown += `\n`;
  }
  
  // Critical Dimensions
  if (data.critical_dimensions && data.critical_dimensions.length > 0) {
    markdown += `## Critical Dimensions\n\n`;
    data.critical_dimensions.forEach(dim => {
      markdown += `- **${dim.description}**: ${dim.dimension}`;
      if (dim.location) markdown += ` (${dim.location})`;
      markdown += `\n`;
    });
    markdown += `\n`;
  }
  
  // Construction Sequence
  if (data.construction_sequence && data.construction_sequence.length > 0) {
    markdown += `## Construction Sequence\n\n`;
    data.construction_sequence.forEach(stage => {
      markdown += `### Stage ${stage.stage}: ${stage.description}\n\n`;
      markdown += `- ${stage.elements.join('\n- ')}\n\n`;
    });
  }
  
  return markdown;
}

function extractMetadata(content: string): {
  sources: string[];
  key_insights: string[];
  risks: string[];
  dates: string[];
} {
  const metadata = {
    sources: [] as string[],
    key_insights: [] as string[],
    risks: [] as string[],
    dates: [] as string[]
  };

  // Extract dates (various formats)
  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi;
  const foundDates = content.match(dateRegex);
  if (foundDates) {
    metadata.dates = [...new Set(foundDates)].slice(0, 10);
  }

  // Extract insights from bullet points or numbered lists
  const insightRegex = /(?:^|\n)[•\-*]\s*(.+?)(?=\n|$)/g;
  const insights = [];
  let match;
  while ((match = insightRegex.exec(content)) !== null) {
    insights.push(match[1].trim());
  }
  metadata.key_insights = insights.slice(0, 10);

  // Extract risk-related content
  const riskKeywords = ['risk', 'concern', 'issue', 'challenge', 'warning', 'caution', 'safety'];
  const lines = content.split('\n');
  const risks = lines.filter(line => 
    riskKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );
  metadata.risks = risks.slice(0, 10);

  return metadata;
}

function determineCategoryFromType(type: string, documentType?: string): string {
  if (type === 'document') {
    const typeMap: Record<string, string> = {
      'drawing': 'Technical Documentation',
      'specification': 'Technical Documentation',
      'contract': 'Contracts & Legal',
      'quote': 'Financial Intelligence',
      'invoice': 'Financial Intelligence',
      'report': 'Project Reports',
      'compliance': 'Compliance & Standards'
    };
    return typeMap[documentType?.toLowerCase() || ''] || 'Project Overview';
  }
  
  const categoryMap: Record<string, string> = {
    'invoice': 'Financial Intelligence',
    'quote': 'Financial Intelligence',
    'contract': 'Contracts & Legal',
    'document': 'Technical Documentation'
  };
  
  return categoryMap[type] || 'Project Overview';
}

function calculateConfidence(extractedContent: string, sourceText?: string): number {
  let confidence = 50; // Base confidence

  // Boost confidence based on content richness
  if (extractedContent.length > 500) confidence += 15;
  if (extractedContent.length > 1500) confidence += 10;

  // Check for structured sections
  const sections = ['specification', 'requirement', 'standard', 'compliance', 'risk', 'date'];
  const sectionsFound = sections.filter(s => 
    extractedContent.toLowerCase().includes(s)
  ).length;
  confidence += sectionsFound * 4;

  // Penalize if source text was missing
  if (!sourceText || sourceText.length < 100) {
    confidence -= 20;
  }

  // Cap confidence between 0-100
  return Math.min(Math.max(confidence, 0), 100);
}
