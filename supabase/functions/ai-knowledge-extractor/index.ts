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
        const fileResponse = await fetch(requestData.data.file_url);
        
        if (fileResponse.ok) {
          const fileBuffer = await fileResponse.arrayBuffer();
          const uint8Array = new Uint8Array(fileBuffer);
          documentImageBase64 = btoa(String.fromCharCode(...uint8Array));
          console.log('Successfully converted document to base64 for vision analysis');
        } else {
          console.warn('Failed to download document:', fileResponse.status);
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
          systemPrompt = `You are an expert construction project analyst with advanced visual analysis capabilities. You specialize in analyzing technical drawings, floor plans, elevations, sections, site plans, and construction documentation.

When analyzing visual documents (drawings, plans, diagrams), extract:

1. **Drawing Information**:
   - Drawing type (floor plan, elevation, section, detail, site plan)
   - Scale and dimensions (measure and extract all dimensions shown)
   - Drawing number and revision details
   - Title block information

2. **Spatial Analysis**:
   - Room names, numbers, and purposes
   - Room dimensions and areas
   - Door and window locations with sizes
   - Wall types and thicknesses
   - Circulation paths and access points

3. **Technical Details**:
   - Materials specified (finishes, structural elements)
   - Symbols and their meanings
   - Annotations and notes
   - Grid lines and references
   - Level markers and heights

4. **Construction Elements**:
   - Structural systems visible
   - MEP (Mechanical, Electrical, Plumbing) elements shown
   - Special features or equipment
   - Construction methods indicated

5. **Compliance & Standards**:
   - Building codes referenced
   - Accessibility requirements
   - Fire safety elements
   - Australian Standards (AS) mentioned

6. **Key Insights**:
   - Critical design decisions
   - Potential construction challenges
   - Coordination points with other trades
   - Important specifications or requirements

Format your response as structured markdown with clear sections. Be extremely detailed and extract ALL visible information from the drawing.`;
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
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const knowledgeContent = aiData.choices[0].message.content;

    console.log('AI extraction completed successfully');

    // Extract metadata from the content
    const metadata = extractMetadata(knowledgeContent);

    const response: ExtractionResponse = {
      knowledge_content: knowledgeContent,
      category: determineCategoryFromType(requestData.type, requestData.data.document_type),
      confidence: calculateConfidence(knowledgeContent, requestData.data.extracted_text),
      metadata
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
