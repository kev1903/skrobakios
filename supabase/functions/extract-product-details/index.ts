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
        content: `You are SkAI, an expert product data extraction assistant. Your task is to meticulously analyze product pages or images and extract ALL available product details.

EXTRACTION GUIDELINES:
- Read the ENTIRE page/image carefully - check product descriptions, specifications, technical details, and any listed features
- Extract dimensions from any format (convert to mm if needed)
- Look for finish/material in product name, description, or specifications
- CRITICAL: For product_code field - look for SKU, Product Code, Model Number, Item Code, or Article Number
  * Check near the product title
  * Check in the product specifications section
  * Look for labels like "SKU:", "Product Code:", "Model:", "Item #", "Code:", "Article Number:", etc.
  * This is a HIGH PRIORITY field - extract it if it exists anywhere on the page
- Default qty to "1" if not found
- Extract lead time from shipping/delivery information
- Be thorough - don't miss details that are present

Return ONLY valid JSON with these fields (use null for truly unknown values, but extract everything you can find):
{
  "product_code": string | null (CRITICAL - look for SKU, Product Code, Model Number, Item Code, Article Number),
  "product_name": string | null,
  "brand": string | null,
  "material": string | null (check product name, description, specs for material info like "Glass", "Metal", "Travertine", "Wood", etc.),
  "width": string | null (in mm, number only - check expandable sections, specification areas, and dimension tables),
  "length": string | null (in mm, number only - check expandable sections, specification areas, and dimension tables),
  "height": string | null (in mm, number only - check expandable sections, specification areas, and dimension tables),
  "depth": string | null (in mm, number only - check expandable sections, specification areas, and dimension tables),
  "color": string | null,
  "finish": string | null (check for finishes like "Brushed", "Polished", "Matte", "Gloss", "Satin", etc.),
  "qty": "1",
  "lead_time": string | null,
  "supplier": string | null,
  "url": string | null (the product page URL)
}

IMPORTANT: 
- Product names often contain finish and material info - extract them!
- CRITICAL: Look for dimensions in expandable sections, collapsible areas, specification tables, and technical details sections
- Dimensions are often hidden in "DIMENSIONS", "Specifications", "Technical Details", or similar sections that may be collapsed by default
- PRIORITY: Product Code/SKU is essential - search thoroughly for any product identifier (SKU, Code, Model #, Item #, etc.)
- Example: "Hartley 8 Light 1.5m Linear Pendant in Brushed Nickel with Silver Travertine"
  - finish: "Brushed" (from "Brushed Nickel")
  - material: "Travertine" or "Metal, Travertine" (from the description)
  - color: "Brushed Nickel" or "Silver"
- Always check product specifications, features, and technical details sections thoroughly`
      }
    ];

    // Add user message with image or URL
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all product details from this image. PRIORITY: Find the Product Code/SKU - look for any labels like 'SKU:', 'Code:', 'Model:', 'Item #:', etc. Also focus on product specifications, dimensions, materials, and brand information. Pay special attention to any dimension specifications shown."
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
        content: `Extract ALL product details from this URL: ${url}

Analyze the ENTIRE page content including:
- CRITICAL PRIORITY: Product Code/SKU - search everywhere:
  * Near the product title (often displayed prominently)
  * In product details/information section
  * In specifications table
  * Look for labels: "SKU:", "Product Code:", "Model:", "Item #:", "Code:", "Article Number:", "Model Number:"
  * Check product metadata
- Product name and title
- Full product description
- Specifications and technical details (INCLUDING expandable/collapsible sections)
- CRITICAL: Check "DIMENSIONS" section, specification tables, and any expandable areas for dimensions
- Features and attributes
- Dimensions (convert to mm if in other units like cm or inches)
- Materials and finishes (often in product name or description)
- Color options
- Shipping/delivery information for lead time
- Brand/manufacturer information

IMPORTANT: 
- Many websites hide dimensions in expandable sections or specification areas. Make sure to check all sections thoroughly.
- Product Code/SKU is HIGH PRIORITY - search the entire page for any product identifier.

Extract every detail you can find. Be thorough and comprehensive.

Also include the URL in the response: ${url}`
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
