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
  password: string;
  activationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, loginEmail, password, activationUrl }: LoginCredentialsRequest = await req.json();

    if (!userEmail || !userName || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userEmail, userName, and password" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determine if this is an activation email or regular credentials
    const isActivationEmail = !!activationUrl;
    const subject = isActivationEmail ? "Welcome to SkrobakiOS - Activate Your Account" : "Your SkrobakiOS Credentials";

    const emailResponse = await resend.emails.send({
      from: "Platform Admin <kevin@skrobaki.com>",
      to: [userEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${isActivationEmail ? 'Welcome to SkrobakiOS!' : 'Your SkrobakiOS Credentials'}
          </h1>
          
          <p>Dear ${userName},</p>
          
          ${isActivationEmail ? 
            '<p>Your SkrobakiOS account has been created! To get started, please activate your account using the secure link below.</p>' :
            '<p>Here are your login credentials for SkrobakiOS:</p>'
          }
          
          ${activationUrl ? `
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #155724;">Account Activation Required</h3>
              <p style="color: #155724;">Click the button below to activate your account and set up your password:</p>
              <div style="margin: 20px 0;">
                <a href="${activationUrl}" 
                   style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Activate Your Account
                </a>
              </div>
              <p style="color: #155724; font-size: 14px;">
                This activation link will expire in 72 hours. If you need a new link, please contact your administrator.
              </p>
            </div>
          ` : `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Login Information</h3>
              <p><strong>Email:</strong> ${loginEmail}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app.com'}/auth" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Platform
              </a>
            </div>
          `}
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Important Security Notice</h4>
            <p style="margin-bottom: 0; color: #856404;">
              ${isActivationEmail ? 
                'After activation, you will be required to create a new password for security purposes. Never share your password with anyone.' :
                'For your security, please change your password immediately after logging in. Go to your profile settings and update your password to something only you know.'
              }
            </p>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
            If you did not request this account or have any security concerns, please contact your system administrator immediately.
          </p>
          
          <p style="color: #6c757d; font-size: 12px;">
            Best regards,<br>
            SkrobakiOS Administration Team
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