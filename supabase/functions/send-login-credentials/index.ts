import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoginCredentialsRequest {
  userEmail: string;
  userName: string;
  loginEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, loginEmail }: LoginCredentialsRequest = await req.json();

    if (!userEmail || !userName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userEmail and userName" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Platform Admin <kevin@skrobaki.com>",
      to: [userEmail],
      subject: "Your Login Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Your Login Credentials
          </h1>
          
          <p>Dear ${userName},</p>
          
          <p>Here are your current login credentials for the platform:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Login Information</h3>
            <p><strong>Email:</strong> ${loginEmail}</p>
            <p><strong>Password:</strong> [Your current password]</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Security Note</h4>
            <p style="margin-bottom: 0; color: #856404;">
              For security reasons, your password is not included in this email. 
              If you need to reset your password, please use the "Forgot Password" option on the login page 
              or contact your administrator.
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app.com'}/auth" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Platform
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
            If you did not request this information or have any security concerns, please contact your system administrator immediately.
          </p>
          
          <p style="color: #6c757d; font-size: 12px;">
            Best regards,<br>
            Platform Administration Team
          </p>
        </div>
      `,
    });

    console.log("Login credentials email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Login credentials sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-login-credentials function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);