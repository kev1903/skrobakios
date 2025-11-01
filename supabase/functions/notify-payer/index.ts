import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Notify payer function called");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch FIN001 knowledge entry
    const { data: knowledge, error: knowledgeError } = await supabase
      .from("skai_knowledge")
      .select("*")
      .eq("prompt_id", "FIN001")
      .single();

    if (knowledgeError || !knowledge) {
      console.error("Error fetching FIN001 knowledge:", knowledgeError);
      return new Response(
        JSON.stringify({ error: "FIN001 knowledge entry not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("FIN001 knowledge found:", knowledge.title);

    // Fetch all unpaid bills
    const { data: bills, error: billsError } = await supabase
      .from("bills")
      .select("*")
      .eq("status", "unpaid");

    if (billsError) {
      console.error("Error fetching bills:", billsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch bills" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group bills by payer email (to_pay field)
    const billsByPayer = bills?.reduce((acc: Record<string, any[]>, bill) => {
      if (bill.to_pay) {
        if (!acc[bill.to_pay]) {
          acc[bill.to_pay] = [];
        }
        acc[bill.to_pay].push(bill);
      }
      return acc;
    }, {}) || {};

    console.log(`Grouped bills for ${Object.keys(billsByPayer).length} payers`);

    // Use Lovable AI to generate email content for each payer
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const emailResults = [];

    for (const [payerEmail, payerBills] of Object.entries(billsByPayer)) {
      console.log(`Processing ${payerBills.length} bills for ${payerEmail}`);

      // Format bills for AI prompt
      const billsList = payerBills.map((bill: any) => 
        `- ${bill.invoice_number || 'N/A'}: ${bill.description || 'No description'} - Amount: $${bill.amount || 0} - Due: ${bill.due_date || 'N/A'}`
      ).join('\n');

      // Call Lovable AI to generate email
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `${knowledge.content}\n\nYou are generating an email to notify a payer about their outstanding bills. Be professional and concise.` 
            },
            { 
              role: "user", 
              content: `Generate an email body for ${payerEmail} about these unpaid bills:\n${billsList}` 
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI generation failed for ${payerEmail}:`, aiResponse.status);
        continue;
      }

      const aiData = await aiResponse.json();
      const emailBody = aiData.choices?.[0]?.message?.content || "Please review your outstanding bills.";

      // Send email using Resend with CC
      const emailResponse = await resend.emails.send({
        from: "SKROBAKI Finance <finance@skrobaki.com>",
        to: [payerEmail],
        cc: ["accounts@skrobaki.com", "kevin@skrobaki.com"],
        subject: "Outstanding Bills - Payment Required",
        html: emailBody,
      });

      console.log(`Email sent to ${payerEmail}:`, emailResponse);
      emailResults.push({ payer: payerEmail, success: true, emailId: emailResponse.data?.id });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification emails sent to ${emailResults.length} payers`,
        results: emailResults 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-payer function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
