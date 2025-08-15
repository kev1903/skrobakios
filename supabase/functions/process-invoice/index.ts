// supabase/functions/process-invoice/index.ts
// Deno Edge Function – parses PDFs via OpenAI Files + Responses (input_file)
// Request body: { signed_url?: string, file_url?: string, project_invoice_id?: string }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const InvoiceSchema = {
  name: "InvoiceExtraction",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["supplier", "invoice_number", "ai_summary", "ai_confidence"],
    properties: {
      supplier: { type: "string" },
      invoice_number: { type: "string" },
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
  const ct = r.headers.get("content-type") || "application/octet-stream";
  const arr = await r.arrayBuffer();
  return { bytes: new Uint8Array(arr), contentType: ct };
}

async function uploadToOpenAI(fileBytes: Uint8Array, filename: string, contentType: string) {
  // Default to application/pdf to avoid Images API path
  const type = contentType.includes("pdf") ? "application/pdf" : contentType || "application/pdf";
  const file = new File([fileBytes], filename, { type });

  const fd = new FormData();
  fd.append("file", file);
  fd.append("purpose", "vision");

  const res = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: fd
  });
  if (!res.ok) throw new Error(`files.create failed ${res.status}: ${await res.text()}`);
  return await res.json(); // { id, ... }
}

async function extractWithOpenAI(fileId: string) {
  const body = {
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You extract invoice fields from PDFs. Prefer the totals section and line item tables. Return ONLY the specified JSON."
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: "Extract supplier, invoice_number, dates, subtotal, tax, total, and line_items." },
          { type: "input_file", file_id: fileId }
        ]
      }
    ],
    response_format: { type: "json_schema", json_schema: InvoiceSchema },
    temperature: 0.1
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`responses.create failed ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const text = data?.output?.[0]?.content?.[0]?.text;
  if (!text) throw new Error(`no structured output: ${JSON.stringify(data).slice(0, 500)}`);
  return JSON.parse(text);
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
  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const { signed_url, file_url, project_invoice_id } = await req.json();
    const src = signed_url || file_url;
    if (!src) {
      return new Response(JSON.stringify({ error: "Provide signed_url or file_url" }), { status: 400 });
    }

    // 1) download
    const { bytes, contentType } = await downloadBytes(src);

    // 2) upload to OpenAI Files (purpose: vision)
    const uploaded = await uploadToOpenAI(bytes, "invoice.pdf", contentType);

    // 3) extract via Responses API (input_file)
    const extraction = await extractWithOpenAI(uploaded.id);

    // 4) update DB (optional)
    if (project_invoice_id) {
      await patchInvoiceRow(project_invoice_id, extraction);
    }

    return new Response(JSON.stringify({ ok: true, data: extraction }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});