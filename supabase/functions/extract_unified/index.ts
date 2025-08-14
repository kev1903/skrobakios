// deno-lint-ignore-file no-explicit-any
// Deno runtime (Supabase Edge Functions)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type UnifiedResult = {
  document_type: "contract" | "drawing" | "spec" | "invoice" | "other";
  ai_summary: string;
  ai_confidence: number; // 0..1
  contract?: {
    title?: string;
    parties?: string[];
    effective_date?: string;
    expiry_date?: string;
    contract_value?: string;
    payment_terms?: string;
    scope_of_work?: string;
    termination_clause?: string;
    special_conditions?: string;
  };
  drawing?: {
    project_name?: string;
    client_name?: string;
    site_address?: string;
    sheet_number?: string;
    sheet_title?: string;
    drawing_set_date?: string;
    revision?: string;
    designers?: string[];
    areas?: {
      site_area_m2?: number;
      build_area_m2?: number;
      landscape_area_m2?: number;
      garage_area_m2?: number;
    };
  };
  spec?: {
    project_name?: string;
    spec_sections?: string[];
    key_materials?: string[];
    revisions?: string[];
  };
  invoice?: {
    supplier?: string;
    invoice_number?: string;
    invoice_date?: string;
    due_date?: string;
    subtotal?: string;
    tax?: string;
    total?: string;
    line_items?: Array<{ description?: string; qty?: string; rate?: string; amount?: string }>;
  };
  other?: Record<string, unknown>;
};

const UnifiedSchema = {
  name: "UnifiedDocExtraction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      document_type: { type: "string", enum: ["contract","drawing","spec","invoice","other"] },
      ai_summary: { type: "string" },
      ai_confidence: { type: "number" },
      contract: { type: "object", additionalProperties: false, properties: {
        title: { type: "string" }, parties: { type: "array", items: { type: "string" } },
        effective_date: { type: "string" }, expiry_date: { type: "string" },
        contract_value: { type: "string" }, payment_terms: { type: "string" },
        scope_of_work: { type: "string" }, termination_clause: { type: "string" },
        special_conditions: { type: "string" }
      }},
      drawing: { type: "object", additionalProperties: false, properties: {
        project_name: { type: "string" }, client_name: { type: "string" }, site_address: { type: "string" },
        sheet_number: { type: "string" }, sheet_title: { type: "string" },
        drawing_set_date: { type: "string" }, revision: { type: "string" },
        designers: { type: "array", items: { type: "string" } },
        areas: { type: "object", additionalProperties: false, properties: {
          site_area_m2: { type: "number" }, build_area_m2: { type: "number" },
          landscape_area_m2: { type: "number" }, garage_area_m2: { type: "number" }
        }}
      }},
      spec: { type: "object", additionalProperties: false, properties: {
        project_name: { type: "string" }, spec_sections: { type: "array", items: { type: "string" } },
        key_materials: { type: "array", items: { type: "string" } }, revisions: { type: "array", items: { type: "string" } }
      }},
      invoice: { type: "object", additionalProperties: false, properties: {
        supplier: { type: "string" }, invoice_number: { type: "string" },
        invoice_date: { type: "string" }, due_date: { type: "string" },
        subtotal: { type: "string" }, tax: { type: "string" }, total: { type: "string" },
        line_items: { type: "array", items: {
          type: "object", additionalProperties: false,
          properties: { description: { type: "string" }, qty: { type: "string" }, rate: { type: "string" }, amount: { type: "string" } }
        }}
      }},
      other: { type: "object", additionalProperties: true }
    },
    required: ["document_type","ai_summary","ai_confidence"]
  }
} as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function fetchAsArrayBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${await res.text()}`);
  return await res.arrayBuffer();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file_url, signed_url, project_contract_id } = await req.json();

    if (!file_url && !signed_url) {
      return new Response(JSON.stringify({ error: "Provide file_url or signed_url" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing document extraction:', { file_url, signed_url, project_contract_id });

    // 1) Download file bytes (prefer signed_url if provided)
    const url = signed_url || file_url;
    const bytes = await fetchAsArrayBuffer(url);
    const blob = new Blob([bytes], { type: "application/octet-stream" });

    console.log('Downloaded file, size:', bytes.byteLength);

    // 2) Upload to OpenAI Files
    const fileUpload = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: (() => {
        const fd = new FormData();
        fd.append("file", new File([blob], "document.bin"));
        fd.append("purpose", "vision");
        return fd;
      })()
    });
    if (!fileUpload.ok) {
      const errorText = await fileUpload.text();
      console.error('OpenAI file upload failed:', errorText);
      return new Response(errorText, { 
        status: fileUpload.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const uploaded = await fileUpload.json();
    console.log('Uploaded to OpenAI, file ID:', uploaded.id);

    // 3) Call Responses API with Structured Outputs
    const responses = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are an extraction engine for construction documents. " +
              "Classify the document and extract fields per type. Return ONLY the JSON matching the schema."
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: "If drawing: use title block. If contract: capture parties, dates, payment terms. If invoice: totals and line items. Provide ai_confidence 0..1." },
              { type: "input_file", file_id: uploaded.id }
            ]
          }
        ],
        response_format: { type: "json_schema", json_schema: UnifiedSchema }
      })
    });
    if (!responses.ok) {
      const errorText = await responses.text();
      console.error('OpenAI responses API failed:', errorText);
      return new Response(errorText, { 
        status: responses.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const rjson: any = await responses.json();
    const text = rjson?.output?.[0]?.content?.[0]?.text;
    if (!text) throw new Error("No structured output from model");
    const data = JSON.parse(text) as UnifiedResult;

    console.log('AI extraction complete:', { 
      document_type: data.document_type, 
      confidence: data.ai_confidence,
      summary_length: data.ai_summary?.length 
    });

    // 4) If it's a contract and we have an ID, update project_contracts
    if (data.document_type === "contract" && project_contract_id) {
      const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/project_contracts?id=eq.${project_contract_id}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          ai_summary_json: { ai_summary: data.ai_summary },
          confidence: Math.max(0, Math.min(1, data.ai_confidence ?? 0)),
          contract_data: data,
          updated_at: new Date().toISOString()
        })
      });

      if (!supabaseRes.ok) {
        const errorText = await supabaseRes.text();
        console.error('Supabase update failed:', errorText);
        return new Response(errorText, { 
          status: supabaseRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Updated project_contracts table for contract ID:', project_contract_id);
    }

    return new Response(JSON.stringify({ ok: true, data }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (e) {
    console.error('Extract unified function error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});