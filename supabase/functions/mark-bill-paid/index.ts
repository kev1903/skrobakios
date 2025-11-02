import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate HMAC token for verification
async function generateToken(billId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(billId);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const billId = url.searchParams.get('billId');
    const token = url.searchParams.get('token');

    if (!billId || !token) {
      return new Response(
        htmlPage("Invalid Request", "Missing bill ID or verification token.", false),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Verify token using RESEND_API_KEY as secret
    const secret = Deno.env.get("RESEND_API_KEY") || "";
    const expectedToken = await generateToken(billId, secret);

    if (token !== expectedToken) {
      return new Response(
        htmlPage("Verification Failed", "Invalid verification token. This link may have been tampered with.", false),
        { status: 403, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for update
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if bill exists and is unpaid
    const { data: bill, error: fetchError } = await supabase
      .from("bills")
      .select("id, payment_status, reference_number, bill_no")
      .eq("id", billId)
      .single();

    if (fetchError || !bill) {
      console.error("Bill not found:", fetchError);
      return new Response(
        htmlPage("Bill Not Found", "The specified bill could not be found.", false),
        { status: 404, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    if (bill.payment_status === "paid") {
      return new Response(
        htmlPage("Already Paid", `Bill ${bill.reference_number || bill.bill_no} has already been marked as paid.`, true),
        { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Update bill to paid status
    const { error: updateError } = await supabase
      .from("bills")
      .update({ 
        payment_status: "paid",
        paid_date: new Date().toISOString()
      })
      .eq("id", billId);

    if (updateError) {
      console.error("Error updating bill:", updateError);
      return new Response(
        htmlPage("Update Failed", "Failed to update bill status. Please try again or contact support.", false),
        { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log(`Bill ${billId} marked as paid successfully`);

    return new Response(
      htmlPage(
        "Payment Confirmed", 
        `Bill ${bill.reference_number || bill.bill_no} has been successfully marked as paid. Thank you!`,
        true
      ),
      { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in mark-bill-paid function:", error);
    return new Response(
      htmlPage("Error", "An unexpected error occurred. Please try again later.", false),
      { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );
  }
};

// HTML page with liquid glass design
function htmlPage(title: string, message: string, success: boolean): string {
  const iconColor = success ? "#10b981" : "#ef4444";
  const icon = success 
    ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="${iconColor}">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="${iconColor}">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - SKROBAKI</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(217, 231, 255, 0.6);
          box-shadow: 0 8px 32px rgba(33, 123, 244, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
          padding: 48px 40px;
          max-width: 500px;
          text-align: center;
        }
        .icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 24px;
          stroke-width: 2;
        }
        h1 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        p {
          color: #334155;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .brand {
          color: #217BF4;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${icon}
        <h1>${title}</h1>
        <p>${message}</p>
        <div class="brand">SKROBAKI</div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
