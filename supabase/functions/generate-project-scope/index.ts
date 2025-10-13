import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScopeRequest {
  projectId: string;
  companyId: string;
  documentIds?: string[];
}

interface ScopeItem {
  category: string;
  element: string;
  location?: string;
  material?: string;
  dimensions?: string;
  quantity?: number;
  unit?: string;
  specification?: string;
  construction_method?: string;
  source_documents: string[];
}

interface GeneratedScope {
  scope_summary: string;
  bill_of_quantities: Array<{
    category: string;
    total_items: number;
    items: Array<{
      description: string;
      quantity: number;
      unit: string;
      material: string;
      specifications: string;
      source_documents: string[];
    }>;
  }>;
  work_breakdown: Array<{
    phase: string;
    trades: string[];
    elements: string[];
    estimated_duration?: string;
  }>;
  material_schedules: {
    doors: any[];
    windows: any[];
    finishes: any[];
    structural: any[];
    services: any[];
  };
  spaces_summary: {
    total_spaces: number;
    total_area: number;
    spaces_by_level: Record<string, number>;
  };
  compliance_summary: Array<{
    standard: string;
    requirements: string[];
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScopeRequest = await req.json();
    console.log('Generating project scope:', requestData);

    if (!requestData.projectId || !requestData.companyId) {
      return new Response(
        JSON.stringify({ error: 'projectId and companyId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analyzed documents with structured data
    let documentsQuery = supabase
      .from('project_documents')
      .select('id, name, metadata, category_id, document_type')
      .eq('project_id', requestData.projectId)
      .eq('processing_status', 'completed')
      .not('metadata', 'is', null);

    if (requestData.documentIds && requestData.documentIds.length > 0) {
      documentsQuery = documentsQuery.in('id', requestData.documentIds);
    }

    const { data: documents, error: docError } = await documentsQuery;

    if (docError) {
      console.error('Error fetching documents:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch documents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No analyzed documents found. Please analyze drawings first.',
          documents_count: 0 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${documents.length} documents with structured data`);

    // Aggregate all construction scope items
    const allScopeItems: ScopeItem[] = [];
    const allSpaces: any[] = [];
    const allOpenings: any[] = [];
    const allServices: any[] = [];
    const allExternalWorks: any[] = [];
    const allCompliance: any[] = [];

    documents.forEach(doc => {
      const metadata = doc.metadata as any;
      if (!metadata) return;

      // Collect scope items
      if (metadata.construction_scope) {
        metadata.construction_scope.forEach((item: any) => {
          allScopeItems.push({
            ...item,
            source_documents: [doc.name]
          });
        });
      }

      // Collect spaces
      if (metadata.spaces) {
        allSpaces.push(...metadata.spaces.map((s: any) => ({ ...s, source: doc.name })));
      }

      // Collect openings
      if (metadata.openings) {
        allOpenings.push(...metadata.openings.map((o: any) => ({ ...o, source: doc.name })));
      }

      // Collect services
      if (metadata.services) {
        allServices.push(...metadata.services.map((s: any) => ({ ...s, source: doc.name })));
      }

      // Collect external works
      if (metadata.external_works) {
        allExternalWorks.push(...metadata.external_works.map((w: any) => ({ ...w, source: doc.name })));
      }

      // Collect compliance
      if (metadata.compliance) {
        allCompliance.push(...metadata.compliance.map((c: any) => ({ ...c, source: doc.name })));
      }
    });

    console.log(`Aggregated data:`, {
      scope_items: allScopeItems.length,
      spaces: allSpaces.length,
      openings: allOpenings.length,
      services: allServices.length,
      external_works: allExternalWorks.length,
      compliance: allCompliance.length
    });

    // Group and consolidate scope items by category
    const scopeByCategory: Record<string, ScopeItem[]> = {};
    allScopeItems.forEach(item => {
      if (!scopeByCategory[item.category]) {
        scopeByCategory[item.category] = [];
      }
      scopeByCategory[item.category].push(item);
    });

    // Build Bill of Quantities
    const billOfQuantities = Object.entries(scopeByCategory).map(([category, items]) => {
      // Consolidate similar items
      const consolidatedItems = new Map<string, any>();

      items.forEach(item => {
        const key = `${item.element}-${item.material || 'unspecified'}`;
        if (consolidatedItems.has(key)) {
          const existing = consolidatedItems.get(key);
          existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
          if (!existing.source_documents.includes(item.source_documents[0])) {
            existing.source_documents.push(...item.source_documents);
          }
        } else {
          consolidatedItems.set(key, {
            description: item.element,
            quantity: item.quantity || 0,
            unit: item.unit || 'EA',
            material: item.material || 'As specified',
            specifications: item.specification || '',
            source_documents: [...item.source_documents]
          });
        }
      });

      return {
        category,
        total_items: consolidatedItems.size,
        items: Array.from(consolidatedItems.values())
      };
    });

    // Build work breakdown by construction phase
    const workBreakdown = generateWorkBreakdown(scopeByCategory);

    // Build material schedules
    const materialSchedules = {
      doors: allOpenings.filter(o => o.type?.toLowerCase().includes('door')),
      windows: allOpenings.filter(o => o.type?.toLowerCase().includes('window')),
      finishes: allScopeItems.filter(i => 
        i.category?.toLowerCase().includes('finish') || 
        i.element?.toLowerCase().includes('finish')
      ),
      structural: allScopeItems.filter(i => 
        i.category?.toLowerCase().includes('structure') ||
        i.category?.toLowerCase().includes('substructure') ||
        i.element?.toLowerCase().includes('beam') ||
        i.element?.toLowerCase().includes('column') ||
        i.element?.toLowerCase().includes('slab')
      ),
      services: allServices
    };

    // Calculate spaces summary
    const spacesSummary = {
      total_spaces: allSpaces.length,
      total_area: allSpaces.reduce((sum, s) => sum + (s.dimensions?.area || 0), 0),
      spaces_by_level: allSpaces.reduce((acc, s) => {
        const level = s.level || 'Unknown';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Consolidate compliance requirements
    const complianceByStandard = new Map<string, Set<string>>();
    allCompliance.forEach(comp => {
      if (!complianceByStandard.has(comp.standard)) {
        complianceByStandard.set(comp.standard, new Set());
      }
      complianceByStandard.get(comp.standard)!.add(comp.requirement);
    });

    const complianceSummary = Array.from(complianceByStandard.entries()).map(([standard, requirements]) => ({
      standard,
      requirements: Array.from(requirements)
    }));

    // Generate AI-powered scope summary if LOVABLE_API_KEY is available
    let scopeSummary = generateDefaultScopeSummary(
      allScopeItems.length,
      spacesSummary,
      billOfQuantities
    );

    if (lovableApiKey) {
      try {
        const aiSummary = await generateAIScopeSummary(
          lovableApiKey,
          documents,
          allScopeItems,
          spacesSummary,
          billOfQuantities
        );
        if (aiSummary) {
          scopeSummary = aiSummary;
        }
      } catch (aiError) {
        console.error('Failed to generate AI summary:', aiError);
        // Continue with default summary
      }
    }

    const generatedScope: GeneratedScope = {
      scope_summary: scopeSummary,
      bill_of_quantities: billOfQuantities,
      work_breakdown: workBreakdown,
      material_schedules: materialSchedules,
      spaces_summary: spacesSummary,
      compliance_summary: complianceSummary
    };

    console.log('Scope generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        scope: generatedScope,
        documents_analyzed: documents.length,
        total_scope_items: allScopeItems.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-project-scope:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateWorkBreakdown(scopeByCategory: Record<string, ScopeItem[]>): Array<{
  phase: string;
  trades: string[];
  elements: string[];
  estimated_duration?: string;
}> {
  const phaseMapping: Record<string, { order: number; trades: string[] }> = {
    'Demolition': { order: 1, trades: ['Demolition Contractor'] },
    'Site Works': { order: 2, trades: ['Earthworks', 'Civil Contractor'] },
    'Substructure': { order: 3, trades: ['Excavation', 'Concretor', 'Formwork'] },
    'Superstructure': { order: 4, trades: ['Bricklayer', 'Carpenter', 'Steel Fixer', 'Concretor'] },
    'External Works': { order: 5, trades: ['Landscaper', 'Paving Contractor', 'Fencing'] },
    'Roofing': { order: 6, trades: ['Roofer', 'Plumber'] },
    'Services': { order: 7, trades: ['Electrician', 'Plumber', 'HVAC Contractor'] },
    'Internal Finishes': { order: 8, trades: ['Plasterer', 'Painter', 'Tiler', 'Flooring', 'Joiner'] },
    'External Finishes': { order: 9, trades: ['Renderer', 'Painter', 'Cladding'] },
    'Fixtures & Fittings': { order: 10, trades: ['Joiner', 'Kitchen Installer'] }
  };

  const breakdown: any[] = [];

  Object.entries(scopeByCategory).forEach(([category, items]) => {
    // Map category to phase
    let phase = category;
    let trades: string[] = [];

    // Try to match to standard phases
    const matchedPhase = Object.keys(phaseMapping).find(p => 
      category.toLowerCase().includes(p.toLowerCase())
    );

    if (matchedPhase) {
      phase = matchedPhase;
      trades = phaseMapping[matchedPhase].trades;
    }

    breakdown.push({
      phase,
      trades: trades.length > 0 ? trades : ['General Contractor'],
      elements: items.map(i => i.element),
      estimated_duration: undefined // Can be enhanced with AI estimation
    });
  });

  // Sort by typical construction sequence
  return breakdown.sort((a, b) => {
    const orderA = phaseMapping[a.phase]?.order || 999;
    const orderB = phaseMapping[b.phase]?.order || 999;
    return orderA - orderB;
  });
}

function generateDefaultScopeSummary(
  totalItems: number,
  spacesSummary: any,
  billOfQuantities: any[]
): string {
  return `# Project Scope Summary

## Overview
This project scope has been automatically generated from ${totalItems} construction elements extracted from analyzed drawings.

## Spatial Summary
- **Total Spaces**: ${spacesSummary.total_spaces}
- **Total Floor Area**: ${spacesSummary.total_area.toFixed(2)}m²
- **Levels**: ${Object.keys(spacesSummary.spaces_by_level).join(', ')}

## Construction Categories
${billOfQuantities.map(cat => `- **${cat.category}**: ${cat.total_items} items`).join('\n')}

## Next Steps
Review the detailed Bill of Quantities and Work Breakdown to create project tasks and timelines.
`;
}

async function generateAIScopeSummary(
  apiKey: string,
  documents: any[],
  scopeItems: ScopeItem[],
  spacesSummary: any,
  billOfQuantities: any[]
): Promise<string | null> {
  const prompt = `You are a Senior Construction Project Manager. Based on the following extracted construction data, provide a comprehensive project scope summary.

Documents Analyzed: ${documents.map(d => d.name).join(', ')}

Spatial Data:
- Total Spaces: ${spacesSummary.total_spaces}
- Total Area: ${spacesSummary.total_area.toFixed(2)}m²
- Levels: ${Object.keys(spacesSummary.spaces_by_level).join(', ')}

Construction Elements: ${scopeItems.length} items across ${billOfQuantities.length} categories

Categories:
${billOfQuantities.map(cat => `- ${cat.category}: ${cat.total_items} items`).join('\n')}

Provide a professional project scope summary (200-300 words) covering:
1. Project Overview
2. Key Construction Elements
3. Spatial Summary
4. Major Work Packages
5. Notable Complexities or Considerations

Format as markdown with clear sections.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a Senior Construction Project Manager writing professional project scope summaries.' },
        { role: 'user', content: prompt }
      ]
    }),
  });

  if (!response.ok) {
    console.error('AI summary generation failed:', response.status);
    return null;
  }

  const aiData = await response.json();
  return aiData.choices[0].message.content;
}
