import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  type: 'document' | 'invoice' | 'quote' | 'contract';
  projectId: string;
  projectName: string;
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
      projectName: requestData.projectName
    });

    let systemPrompt = '';
    let userPrompt = '';

    if (requestData.type === 'document') {
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

      const documentInfo = `
Document Name: ${requestData.data.name || 'Unknown'}
Document Type: ${requestData.data.document_type || 'Unknown'}
Content Type: ${requestData.data.content_type || 'Unknown'}
File URL: ${requestData.data.file_url || 'Not provided'}

${requestData.data.extracted_text 
  ? `Extracted Text:\n${requestData.data.extracted_text}` 
  : 'Note: This document has not been OCR processed yet. Analyze based on the file name, type, and metadata provided above.'}
`;

      userPrompt = `Analyze this construction project document for project "${requestData.projectName}":\n\n${documentInfo}\n\nProvide comprehensive knowledge extraction as structured markdown.`;
    }

    console.log('Calling Lovable AI with Gemini 2.5 Flash...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
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
