// Deno Edge Function – parses PDFs via Lovable AI (Gemini)
// Supports: URL (signed_url/file_url) or direct base64 (fileData)
// Request body: { signed_url?: string, file_url?: string, fileData?: string (base64), project_invoice_id?: string }
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const InvoiceSchema = {
  name: "InvoiceExtraction",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["supplier", "invoice_number", "ai_summary", "ai_confidence"],
    properties: {
      supplier: { type: "string" },
      supplier_email: { type: "string" },
      invoice_number: { type: "string" },
      reference_number: { type: "string" },
      invoice_date: { type: "string" },
      due_date: { type: "string" },
      subtotal: { type: "string" }, // keep as text; normalise client-side if needed
      tax: { type: "string" },
      total: { type: "string" },
      line_items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            description: { type: "string" },
            qty: { type: "string" },
            rate: { type: "string" },
            amount: { type: "string" },
            tax_code: { type: "string" }
          }
        }
      },
      ai_summary: { type: "string" },
      ai_confidence: { type: "number" }
    }
  }
} as const;

async function downloadBytes(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download failed ${r.status}: ${await r.text()}`);
  const ct = r.headers.get("content-type") || "application/pdf";
  const arr = await r.arrayBuffer();
  
  // Check file size (max 5MB for better AI processing)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (arr.byteLength > maxSize) {
    const sizeMB = (arr.byteLength / 1024 / 1024).toFixed(2);
    throw new Error(`PDF file is too large (${sizeMB}MB). Maximum size is 5MB. Please compress the PDF using tools like https://www.ilovepdf.com/compress_pdf before uploading.`);
  }
  
  return { bytes: new Uint8Array(arr), contentType: ct };
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

async function extractWithLovableAI(pdfBase64: string) {
  console.log("Starting extractWithLovableAI with structured output");
  
  const body = {
    model: "google/gemini-2.5-pro",
    messages: [
      { 
        role: "system", 
        content: "You are an expert at extracting invoice data from PDFs. Extract ALL line items from the invoice - do not miss any products, materials, or services listed. Payment terms like 'deposit due' or 'balance due' are NOT line items. Focus on extracting the actual goods/services being invoiced. Extract the COMPLETE invoice number (e.g., 'INV-2025-0010' not just 'Invoice')." 
      },
      {
        role: "user",
        content: `Extract ALL line items from this invoice PDF. Include every single product, material, or service listed with their descriptions, quantities, rates, and amounts. Do not extract payment terms as line items. Also extract supplier name, supplier email (if present), COMPLETE invoice number (e.g., INV-2025-0010), reference/PO number (if present), dates, subtotal, tax, and total. Here's the PDF (base64): ${pdfBase64}`
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "extract_invoice_data",
          description: "Extract structured data from an invoice PDF",
          parameters: {
            type: "object",
            properties: {
              supplier: { type: "string", description: "Supplier/vendor company name" },
              supplier_email: { type: "string", description: "Supplier email if present, empty string otherwise" },
              invoice_number: { type: "string", description: "COMPLETE invoice number (e.g., INV-2025-0010)" },
              reference_number: { type: "string", description: "PO or reference number if present, empty string otherwise" },
              invoice_date: { type: "string", description: "Invoice date as string" },
              due_date: { type: "string", description: "Due date as string" },
              subtotal: { type: "string", description: "Subtotal amount as string" },
              tax: { type: "string", description: "Tax amount as string" },
              total: { type: "string", description: "Total amount as string" },
              line_items: {
                type: "array",
                description: "All line items from the invoice",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    qty: { type: "string" },
                    rate: { type: "string" },
                    amount: { type: "string" },
                    tax_code: { type: "string" }
                  },
                  required: ["description", "qty", "rate", "amount"]
                }
              },
              ai_summary: { type: "string", description: "Brief summary of the invoice" },
              ai_confidence: { type: "number", description: "Confidence score 0-1" }
            },
            required: ["supplier", "invoice_number", "ai_summary", "ai_confidence"]
          }
        }
      }
    ],
    tool_choice: { type: "function", function: { name: "extract_invoice_data" } }
  };

  console.log("Calling Lovable AI Gateway");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${LOVABLE_API_KEY}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(body)
  });
  
  console.log("Response status:", res.status);
  
  if (!res.ok) {
    const responseText = await res.text();
    console.log("Error response body:", responseText.substring(0, 500));
    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (res.status === 402) {
      throw new Error("Payment required. Please add credits to your Lovable AI workspace.");
    }
    throw new Error(`Lovable AI failed ${res.status}: ${responseText}`);
  }

  const data = await res.json();
  console.log("Parsed response data");
  
  // Extract from tool call
  const toolCalls = data?.choices?.[0]?.message?.tool_calls;
  if (toolCalls && toolCalls.length > 0) {
    const functionCall = toolCalls[0];
    if (functionCall.function?.name === "extract_invoice_data") {
      console.log("Extracted from tool call:", functionCall.function.arguments);
      const extractedData = JSON.parse(functionCall.function.arguments);
      return extractedData;
    }
  }
  
  // Fallback: try to parse from content
  const text = data?.choices?.[0]?.message?.content;
  if (text) {
    console.log("Attempting to parse from content:", text.substring(0, 200));
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse JSON from content:", parseError);
    }
  }
  
  throw new Error(`No valid data in response: ${JSON.stringify(data).slice(0, 500)}`);
}

async function patchInvoiceRow(id: string, extraction: any) {
  const payload = {
    supplier: extraction?.supplier ?? null,
    invoice_number: extraction?.invoice_number ?? null,
    invoice_date: extraction?.invoice_date ?? null,
    due_date: extraction?.due_date ?? null,
    subtotal: extraction?.subtotal ?? null,
    tax: extraction?.tax ?? null,
    total: extraction?.total ?? null,
    ai_summary_json: { ai_summary: extraction?.ai_summary ?? "" },
    confidence: extraction?.ai_confidence ?? 0,
    extracted_data: extraction,
    updated_at: new Date().toISOString()
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/project_invoices?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`DB patch failed ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    console.log("Request received, parsing body...");
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    let body;
    try {
      const text = await req.text();
      console.log("Raw body length:", text.length);
      console.log("Raw body preview:", text.substring(0, 200));
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: String(parseError)
      }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...cors } 
      });
    }
    
    const { signed_url, file_url, project_invoice_id, fileData } = body;
    console.log("Parsed request:", { 
      has_signed_url: !!signed_url, 
      has_file_url: !!file_url, 
      has_fileData: !!fileData,
      project_invoice_id 
    });
    
    let pdfBase64: string;
    
    // Handle base64 data directly (from drag-and-drop)
    if (fileData) {
      console.log("Processing base64 fileData");
      // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
      if (fileData.startsWith('data:')) {
        const base64Data = fileData.split(',')[1];
        pdfBase64 = base64Data;
      } else {
        pdfBase64 = fileData;
      }
      console.log("Base64 data extracted, length:", pdfBase64.length);
    } 
    // Handle URL-based files
    else {
      const src = signed_url || file_url;
      if (!src) {
        console.error("No URL or fileData provided in request");
        return new Response(JSON.stringify({ 
          error: "Provide signed_url, file_url, or fileData" 
        }), { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...cors } 
        });
      }

      console.log("Downloading PDF from:", src.substring(0, 100));
      const { bytes } = await downloadBytes(src);
      
      console.log("Converting PDF to base64");
      pdfBase64 = bytesToBase64(bytes);
    }
    
    console.log("Extracting invoice data with Lovable AI");
    const extraction = await extractWithLovableAI(pdfBase64);

    if (project_invoice_id) {
      console.log("Updating invoice in database");
      await patchInvoiceRow(project_invoice_id, extraction);
    }

    return new Response(JSON.stringify({ ok: true, data: extraction }), {
      headers: { "Content-Type": "application/json", ...cors }
    });
  } catch (e) {
    console.error("Error processing invoice:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...cors }
    });
  }
});