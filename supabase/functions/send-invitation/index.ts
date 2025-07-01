
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  projectName: string;
  inviterName: string;
  token: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, inviterName, token, role }: InvitationEmailRequest = await req.json();

    console.log('Sending invitation email to:', email, 'for project:', projectName);

    // Create the invitation acceptance URL
    const acceptUrl = `${req.headers.get('origin') || 'http://localhost:8080'}/accept-invitation?token=${token}`;

    const emailResponse = await resend.emails.send({
      from: "Team Invitations <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Team Invitation</h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 16px;">
              Hello! <strong>${inviterName}</strong> has invited you to join the project:
            </p>
            
            <h2 style="color: #2563eb; margin: 16px 0;">${projectName}</h2>
            
            <p style="margin: 16px 0;">
              <strong>Your role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you can't click the button above, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${acceptUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

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
    console.error("Error sending invitation email:", error);
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
