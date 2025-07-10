import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== TEST EMAIL FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    console.log("Environment check:", {
      hasResendKey: !!resendApiKey,
      keyLength: resendApiKey?.length || 0,
      keyPrefix: resendApiKey ? resendApiKey.substring(0, 8) + '...' : 'none'
    });

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email from request
    const { email } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending test email to:", email);

    // Test email send
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Test <info@skrobaki.com>',
        to: [email],
        subject: 'Test Email from Supabase Edge Function',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email to verify that email sending is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
      }),
    });

    console.log("Email API response status:", emailResponse.status);

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Failed to send email:", emailError);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email sending failed",
          details: emailError,
          status: emailResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email sent successfully",
        emailResult
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Test email function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);