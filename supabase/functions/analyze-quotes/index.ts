import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Quote {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  scopeCoverage: number;
  leadTime: number;
  isCompliant: boolean;
  validityDate: string;
  complianceRating?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quotes, rfqTitle, projectId } = await req.json();
    
    if (!quotes || quotes.length === 0) {
      throw new Error("No quotes provided for analysis");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the prompt for AI analysis
    const systemPrompt = `You are SkAi, an expert construction procurement analyst specializing in quote evaluation. 
Analyze quotes based on five key criteria:
1. Quality (0-100): Vendor reputation, compliance rating, past performance
2. Availability (0-100): Lead time, delivery schedule reliability
3. Performance (0-100): Scope coverage, technical capability, project fit
4. Compliance (0-100): Regulatory compliance, safety standards, certifications
5. Cost (0-100): Price competitiveness, value for money (lower cost = higher score)

Provide a comprehensive analysis that helps construction managers make informed procurement decisions.
Be specific, actionable, and highlight both strengths and concerns for each vendor.`;

    const userPrompt = `Analyze these quotes for "${rfqTitle}":

${quotes.map((q: Quote, i: number) => `
Quote ${i + 1}: ${q.vendorName}
- Amount: $${q.amount?.toLocaleString() || 'N/A'}
- Scope Coverage: ${q.scopeCoverage || 'N/A'}%
- Lead Time: ${q.leadTime || 'N/A'} days
- Compliant: ${q.isCompliant ? 'Yes' : 'No'}
- Compliance Rating: ${q.complianceRating || 'N/A'}
- Validity: ${q.validityDate || 'N/A'}
`).join('\n')}

Provide your analysis in this exact JSON structure:
{
  "recommendation": {
    "vendorName": "Best vendor name",
    "vendorId": "vendor ID",
    "overallScore": 85,
    "reasoning": "2-3 sentences explaining why this is the best choice"
  },
  "scoreBreakdown": {
    "quality": 85,
    "availability": 90,
    "performance": 88,
    "compliance": 92,
    "cost": 75
  },
  "insights": [
    {
      "type": "positive",
      "message": "Key positive finding about the quotes"
    },
    {
      "type": "warning",
      "message": "Important concern or risk to consider"
    },
    {
      "type": "info",
      "message": "Additional relevant information"
    }
  ],
  "comparison": [
    {
      "vendorName": "Vendor name",
      "totalScore": 85,
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Consideration 1", "Consideration 2"]
    }
  ]
}`;

    // Call Lovable AI API
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Payment required. Please add credits to your workspace.");
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI analysis");
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisText);
      throw new Error("Invalid response format from AI");
    }

    // Log the analysis for project tracking
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseClient.from("ai_suggestions").insert({
      project_id: projectId,
      suggestion_type: "insight",
      priority: "high",
      category: "general",
      title: `Quote Analysis: ${rfqTitle}`,
      description: `AI analyzed ${quotes.length} quotes and recommends ${analysis.recommendation.vendorName}`,
      action_items: [{
        action: "Review AI quote analysis",
        link: null
      }],
      metadata: {
        rfqTitle,
        recommendedVendor: analysis.recommendation.vendorName,
        overallScore: analysis.recommendation.overallScore,
        quotesAnalyzed: quotes.length
      }
    });

    return new Response(
      JSON.stringify({ success: true, analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in analyze-quotes function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
