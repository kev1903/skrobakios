import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured. Please add it in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the document
    const { data: document, error: docError } = await supabase
      .from("project_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the prompt for AI analysis
    const systemPrompt = `You are SkAi, an expert construction project document analyst. Analyze the provided document and extract key information including:
- Document type and purpose
- Key findings and important details
- Potential risks or issues identified
- Recommendations or action items
- Relevant dates, costs, or quantities mentioned

Provide a comprehensive but concise summary that would be useful for project management.`;

    const userPrompt = `Analyze this construction project document:

Document Name: ${document.name}
Document Type: ${document.document_type || 'Unknown'}
Category: ${document.category || 'Uncategorized'}

Please provide a detailed analysis of this document focusing on construction project management aspects.`;

    // Call Lovable AI
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
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
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
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const aiSummary = aiResult.choices?.[0]?.message?.content;

    if (!aiSummary) {
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the document with AI summary
    const { error: updateError } = await supabase
      .from("project_documents")
      .update({
        ai_summary: aiSummary,
        processing_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Error updating document:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        summary: aiSummary,
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
