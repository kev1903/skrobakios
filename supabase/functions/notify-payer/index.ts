import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { BillNotificationEmail } from './_templates/bill-notification.tsx';

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

    // Fetch FIN001 knowledge entry (optional - for reference)
    const { data: knowledge } = await supabase
      .from("skai_knowledge")
      .select("*")
      .eq("prompt_id", "FIN001")
      .single();

    if (knowledge) {
      console.log("FIN001 knowledge found:", knowledge.title);
    }

    // Fetch all unpaid bills
    const { data: bills, error: billsError } = await supabase
      .from("bills")
      .select("*")
      .eq("payment_status", "unpaid")
      .not("to_pay", "is", null);

    if (billsError) {
      console.error("Error fetching bills:", billsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch bills" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${bills?.length || 0} unpaid bills with payers assigned`);

    // Helper function to check if string is a valid email
    const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    
    // Separate UUIDs from email addresses in to_pay field
    const payerIds: string[] = [];
    const directEmails: string[] = [];
    
    bills?.forEach(bill => {
      if (bill.to_pay) {
        if (isEmail(bill.to_pay)) {
          directEmails.push(bill.to_pay);
        } else {
          payerIds.push(bill.to_pay);
        }
      }
    });
    
    if (payerIds.length === 0 && directEmails.length === 0) {
      console.log("No payer IDs or emails found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No bills with assigned payers",
          results: [] 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch stakeholders for UUID-based payers
    let stakeholderMap: Record<string, any> = {};
    
    if (payerIds.length > 0) {
      const { data: stakeholders, error: stakeholdersError } = await supabase
        .from("stakeholders")
        .select("id, display_name, primary_email")
        .in("id", [...new Set(payerIds)]);

      if (stakeholdersError) {
        console.error("Error fetching stakeholders:", stakeholdersError);
      } else {
        stakeholderMap = stakeholders?.reduce((acc: Record<string, any>, s) => {
          acc[s.id] = s;
          return acc;
        }, {}) || {};
      }
    }

    // Group bills by payer email
    const billsByPayer = bills?.reduce((acc: Record<string, any[]>, bill) => {
      let payerEmail: string | null = null;
      
      if (bill.to_pay) {
        if (isEmail(bill.to_pay)) {
          // Direct email
          payerEmail = bill.to_pay;
        } else {
          // UUID - look up stakeholder
          const stakeholder = stakeholderMap[bill.to_pay];
          payerEmail = stakeholder?.primary_email || null;
        }
      }
      
      if (payerEmail) {
        if (!acc[payerEmail]) {
          acc[payerEmail] = [];
        }
        acc[payerEmail].push(bill);
      } else {
        console.warn(`Bill ${bill.id} has to_pay ${bill.to_pay} but no email could be determined`);
      }
      return acc;
    }, {}) || {};

    console.log(`Grouped bills for ${Object.keys(billsByPayer).length} payers`);

    const emailResults = [];

    for (const [payerEmail, payerBills] of Object.entries(billsByPayer)) {
      console.log(`Processing ${payerBills.length} bills for ${payerEmail}`);

      // Render the React Email template
      const emailHtml = await renderAsync(
        React.createElement(BillNotificationEmail, {
          payerEmail,
          bills: payerBills,
        })
      );

      // Send email using Resend with CC
      const emailResponse = await resend.emails.send({
        from: "SKROBAKI Finance <finance@skrobaki.com>",
        to: [payerEmail],
        cc: ["accounts@skrobaki.com", "kevin@skrobaki.com"],
        subject: "Outstanding Bills - Payment Required",
        html: emailHtml,
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
