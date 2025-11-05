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
- CRITICAL: For product_code field - look for SKU, Product Code, Model Number, Item Code, or Article Number
  * Check near the product title
  * Check in the product specifications section
  * Look for labels like "SKU:", "Product Code:", "Model:", "Item #", "Code:", "Article Number:", etc.
  * This is a HIGH PRIORITY field - extract it if it exists anywhere on the page
- CRITICAL: For price field - this is ESSENTIAL and HIGH PRIORITY:
  * Look for the main product price displayed prominently on the page
  * Check for price labels like: "Price:", "$", "AUD", "NZD", "USD", "Price inc. GST", "Retail Price", "Our Price"
  * Price is usually shown near the product title or in a pricing section
  * Extract ONLY the numeric value (e.g., "299.99" not "$299.99")
  * If multiple prices are shown (e.g., sale price vs regular price), extract the current/sale price
  * Look for price in product metadata, JSON-LD data, or structured data
  * Common locations: near "Add to Cart" button, in product info section, price display area
- CRITICAL: For DIMENSIONS - this is HIGH PRIORITY:
  * FIRST: Check the product name/title - dimensions are often included directly in product names
  * Common formats in product names:
    - "125 x 6 x 22.23mm" (width x thickness x bore for discs/wheels)
    - "1500mm x 120mm" or "1500 x 120" (length x width)
    - "150 x 50 x 25mm" (width x height x depth)
    - Single dimensions: "125mm", "1500mm diameter"
  * THEN: Check specification sections, dimension tables, technical details (may be expandable/collapsible)
  * Look for labels: "Dimensions:", "Size:", "Measurements:", "Diameter:", "Length:", "Width:", "Height:", "Depth:"
  * For circular/disc products: diameter → width, thickness → height, bore → depth
  * For rectangular products: map to width, height, depth/length appropriately
  * Convert ALL dimensions to millimeters (mm): cm × 10, inches × 25.4
  * Extract ONLY numeric values (e.g., "125" not "125mm")
  * Examples:
    - Product: "Makita 125 x 6 x 22.23mm Metal Grinding Disc" → width: "125", height: "6", depth: "22.23"
    - Product: "1500mm x 120mm Timber Board" → width: "1500", height: "120"
    - Spec: "Diameter: 5 inches" → width: "127" (5 × 25.4mm)
- Look for finish/material in product name, description, or specifications
- Default qty to "1" if not found
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
  "price": string | null (extract the price as a number only, no currency symbols - look for the main selling price, retail price, or current price),
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
            text: "Extract all product details from this image. CRITICAL PRIORITIES: 1) Product Code/SKU - look for labels like 'SKU:', 'Code:', 'Model:', 'Item #:', etc. 2) DIMENSIONS - parse from product name first (e.g., '125 x 6 x 22.23mm'), then check specification areas. 3) PRICE - extract the main price. Focus on product specifications, dimensions, materials, and brand information."
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
- CRITICAL PRIORITY: PRICE - this is ESSENTIAL:
  * Look for the main displayed price on the page
  * Check near product title, "Add to Cart" button, or price display section
  * Price labels may include: "$", "AUD", "NZD", "Price:", "Price inc. GST", "Our Price", "Retail Price"
  * Extract ONLY the numeric value (e.g., if you see "$49.99", extract "49.99")
  * If there's a sale price and regular price, extract the current/active price
  * Check for price in structured data or JSON-LD metadata
- CRITICAL PRIORITY: DIMENSIONS - HIGH PRIORITY:
  * FIRST: Parse dimensions directly from the product name/title (most common for hardware, tools, building materials)
  * Look for patterns like: "125 x 6 x 22.23mm", "1500 x 120", "150mm x 50mm x 25mm"
  * THEN: Check "Dimensions:", "Specifications", "Technical Details", "Size:", "Measurements:" sections
  * These sections may be expandable/collapsible - make sure to check them
  * For circular products (discs, wheels): diameter → width, thickness → height, bore/arbor → depth
  * For rectangular products: appropriately map to width, height, depth/length
  * Convert all to mm (cm × 10, inches × 25.4), extract numeric values only
  * Examples:
    - "Makita 125 x 6 x 22.23mm Disc" → width: "125", height: "6", depth: "22.23"
    - "1500mm x 120mm Board" → width: "1500", height: "120"
- Product name and title
- Full product description
- Specifications and technical details (INCLUDING expandable/collapsible sections)
- Features and attributes
- Materials and finishes (often in product name or description)
- Color options
- Brand/manufacturer information

IMPORTANT: 
- DIMENSIONS are often in the product name itself - parse them first before checking specification sections
- Many websites hide dimensions in expandable sections or specification areas. Make sure to check all sections thoroughly.
- Product Code/SKU is HIGH PRIORITY - search the entire page for any product identifier.
- PRICE is CRITICAL and MANDATORY - look everywhere for the product price. It's usually prominently displayed on e-commerce pages.

Extract every detail you can find. Be thorough and comprehensive. DIMENSIONS, PRICE, and PRODUCT CODE are especially important.

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
