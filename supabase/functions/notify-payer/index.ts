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

    // SECURITY: Get auth token from request to respect RLS and company isolation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // Use SUPABASE_ANON_KEY or fallback to apikey header
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || 
      req.headers.get('apikey') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw';
    
    // Create client with user's auth token - this respects RLS and company isolation
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    // Note: No need to pass JWT to getUser() since it's already in global headers
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Fetch FIN001 knowledge entry (optional - for reference)
    const { data: knowledge } = await supabase
      .from("skai_knowledge")
      .select("*")
      .eq("prompt_id", "FIN001")
      .single();

    if (knowledge) {
      console.log("FIN001 knowledge found:", knowledge.title);
    }

    // SECURITY: RLS automatically filters bills by company through company_members table
    // Users can only see bills from companies they are active members of
    const { data: bills, error: billsError } = await supabase
      .from("bills")
      .select("*, projects(name, project_id)")
      .eq("payment_status", "unpaid")
      .not("to_pay", "is", null);

    console.log(`User ${user.id} has access to ${bills?.length || 0} unpaid bills (RLS filtered by company)`);

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
      console.log("No payer IDs or emails found in accessible bills");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No bills with assigned payers in your companies",
          results: [] 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch stakeholders for UUID-based payers (RLS filtered by company)
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
        console.log(`Fetched ${Object.keys(stakeholderMap).length} stakeholders (RLS filtered by company)`);
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

      // Get payer name from stakeholder or use email
      let payerName = payerEmail.split('@')[0]; // Default to email username
      const firstBill = payerBills[0];
      if (firstBill && firstBill.to_pay && !isEmail(firstBill.to_pay)) {
        const stakeholder = stakeholderMap[firstBill.to_pay];
        if (stakeholder?.display_name) {
          payerName = stakeholder.display_name;
        }
      }

      // Fetch bill attachments from storage (RLS on storage applies company isolation)
      const attachments = [];
      for (const bill of payerBills) {
        if (bill.bill_file_path) {
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from('bills')
              .download(bill.bill_file_path);
            
            if (fileError) {
              console.warn(`Could not fetch bill file for ${bill.id}:`, fileError);
            } else if (fileData) {
              const arrayBuffer = await fileData.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const fileName = bill.bill_file_path.split('/').pop() || `bill-${bill.invoice_number || bill.bill_no}.pdf`;
              
              attachments.push({
                filename: fileName,
                content: buffer,
              });
            }
          } catch (err) {
            console.warn(`Error downloading bill file ${bill.bill_file_path}:`, err);
          }
        }
      }
      
      console.log(`Attached ${attachments.length} files for ${payerEmail}`);

      // Render the React Email template
      const emailHtml = await renderAsync(
        React.createElement(BillNotificationEmail, {
          payerName,
          bills: payerBills,
        })
      );

      // Send email using Resend with CC and attachments
      const emailPayload: any = {
        from: "SKROBAKI Finance <finance@skrobaki.com>",
        to: [payerEmail],
        cc: ["accounts@skrobaki.com", "kevin@skrobaki.com"],
        subject: "Project Cost Invoices for Your Payment",
        html: emailHtml,
      };

      if (attachments.length > 0) {
        emailPayload.attachments = attachments;
      }

      const emailResponse = await resend.emails.send(emailPayload);

      console.log(`Email sent to ${payerEmail} with ${attachments.length} attachments:`, emailResponse);
      emailResults.push({ payer: payerEmail, success: true, emailId: emailResponse.data?.id, attachments: attachments.length });
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
