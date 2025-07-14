import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ActivationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: ActivationEmailRequest = await req.json();

    console.log(`Sending activation email to ${email} for ${firstName} ${lastName}`);

    // Create activation link (in a real app, you might generate a token)
    const activationLink = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?type=signup&redirect_to=${encodeURIComponent('https://9e8e7d3f-739b-468c-8264-e51262cc4144.lovableproject.com/?activated=true')}`;

    const emailResponse = await resend.emails.send({
      from: "SkrobakiOS <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to SkrobakiOS - Activate Your Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SkrobakiOS</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h1 style="color: white; font-size: 28px; font-weight: bold; margin: 0; margin-bottom: 8px;">Welcome to SkrobakiOS!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">Your complete business management platform</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Hi ${firstName}!</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for joining SkrobakiOS! We're excited to help you streamline your business operations and boost your productivity.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                To get started, please activate your account by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${activationLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                  Activate My Account
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What's next?</h3>
                <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Complete your profile setup</li>
                  <li style="margin-bottom: 8px;">Explore project management tools</li>
                  <li style="margin-bottom: 8px;">Connect with your team</li>
                  <li style="margin-bottom: 8px;">Start your first project</li>
                </ul>
              </div>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                  <strong>Need help?</strong> Contact our support team or visit our help center for assistance.
                </p>
              </div>
              
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.4; margin: 24px 0 0 0; text-align: center;">
                If you didn't create an account with SkrobakiOS, you can safely ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 SkrobakiOS. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                Modern construction management platform
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Activation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-activation-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);