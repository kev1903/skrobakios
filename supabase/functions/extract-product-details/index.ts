import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing product from:', url ? 'URL' : 'image');

    // Build the message content
    const messages: any[] = [
      {
        role: "system",
        content: `You are SkAI, an expert product data extraction assistant. Extract product details from images or URLs.
Return ONLY valid JSON with these fields (use null for unknown values):
{
  "product_code": string | null,
  "product_name": string | null,
  "brand": string | null,
  "material": string | null,
  "width": string | null (in mm, number only),
  "length": string | null (in mm, number only),
  "height": string | null (in mm, number only),
  "depth": string | null (in mm, number only),
  "color": string | null,
  "finish": string | null,
  "qty": string | null (number only),
  "lead_time": string | null,
  "supplier": string | null
}`
      }
    ];

    // Add user message with image or URL
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all product details from this image. Focus on product specifications, dimensions, materials, and brand information."
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          }
        ]
      });
    } else if (url) {
      messages.push({
        role: "user",
        content: `Extract product details from this URL: ${url}\n\nAnalyze the URL content and extract all relevant product information.`
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log('AI Response:', content);

    // Parse the JSON response
    let productData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      productData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error("Failed to parse product data from AI response");
    }

    return new Response(
      JSON.stringify({ success: true, productData }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in extract-product-details:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
