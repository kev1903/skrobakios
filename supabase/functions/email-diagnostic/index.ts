import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== EMAIL DIAGNOSTIC FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, testType = "simple" } = await req.json();

    let emailConfig;
    
    switch (testType) {
      case "simple":
        emailConfig = {
          from: 'Test <onboarding@resend.dev>',
          to: [email],
          subject: 'Simple Test Email',
          html: '<h1>Simple Test</h1><p>This is a simple test email.</p>',
        };
        break;
        
      case "domain":
        emailConfig = {
          from: 'Test <info@skrobaki.com>',
          to: [email],
          subject: 'Domain Test Email',
          html: '<h1>Domain Test</h1><p>Testing from skrobaki.com domain.</p>',
        };
        break;
        
      case "invitation-simple":
        emailConfig = {
          from: 'Invitation <info@skrobaki.com>',
          to: [email],
          subject: 'Account Setup',
          html: '<h1>Account Setup</h1><p>Simple invitation email test.</p><p><a href="https://example.com">Setup Account</a></p>',
        };
        break;
        
      case "invitation-complex":
        emailConfig = {
          from: 'Invitation System <info@skrobaki.com>',
          to: [email],
          subject: 'Welcome - Complete Your Account Setup',
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome</h1>
                </div>
                <div style="padding: 40px 30px;">
                  <h2>Hello Test User,</h2>
                  <p>You've been invited to join our platform.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://example.com?token=test123" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px;">
                      Complete Account Setup
                    </a>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        break;
        
      default:
        throw new Error("Invalid test type");
    }

    console.log(`Testing email type: ${testType}`);
    console.log(`To: ${email}`);
    console.log(`From: ${emailConfig.from}`);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailConfig),
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
          status: emailResponse.status,
          testType
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${testType} test email sent successfully`,
        emailResult,
        testType,
        recipient: email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Diagnostic email function error:", error);
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