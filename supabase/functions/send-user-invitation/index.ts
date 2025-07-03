
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  name: string;
  role: string;
  invitedBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name, role, invitedBy }: InvitationRequest = await req.json();

    // Map display role to database role
    const mapRoleToDbRole = (role: string): 'superadmin' | 'admin' | 'user' => {
      switch (role) {
        case 'Super Admin':
          return 'superadmin';
        case 'Project Manager':
        case 'Project Admin':
        case 'Consultant':
        case 'SubContractor':
        case 'Estimator':
        case 'Accounts':
          return 'admin';
        default:
          return 'user';
      }
    };

    // Get the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated and is a superadmin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("user_invitations")
      .insert({
        email,
        invited_role: mapRoleToDbRole(role),
        invited_by_user_id: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send invitation email
    const invitationUrl = `${req.headers.get("origin")}/accept-invitation?token=${invitation.token}`;
    
    const emailResponse = await resend.emails.send({
      from: "KAKSIK <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join KAKSIK as ${role}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">Welcome to KAKSIK!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 25%, #dbeafe 50%, #e0e7ff 75%, #f1f5f9 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              Hello <strong>${name}</strong>,
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              You've been invited by <strong>${invitedBy}</strong> to join KAKSIK as a <strong style="color: #3730a3;">${role}</strong>.
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Click the button below to accept your invitation and set up your account:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);">
                Accept Invitation
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
              <strong>Note:</strong> This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              <a href="#" style="color: #3b82f6; text-decoration: none;">KAKSIK</a> - Modern Task Management
            </p>
          </div>
        </div>
      `,
    });

    console.log("Invitation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, invitation }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
