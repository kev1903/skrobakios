import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  console.log("=== SEND USER INVITATION FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Basic setup working...");
    
    // Test environment variables first
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:", {
      hasResendKey: !!resendApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey
    });

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test Supabase client creation
    const supabaseClient = createClient(supabaseUrl ?? "", serviceRoleKey ?? "");
    console.log("Supabase client created successfully");

    // Test request parsing
    const requestData = await req.json();
    console.log("Request data:", requestData);

    const { email, name, role, invitedBy } = requestData as InvitationRequest;

    // Test auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authentication successful for user:", user.id);

    // Map role
    const mapRoleToDbRole = (role: string): 'superadmin' | 'admin' | 'user' => {
      switch (role) {
        case 'Super Admin': return 'superadmin';
        case 'Project Manager':
        case 'Project Admin':
        case 'Consultant':
        case 'SubContractor':
        case 'Estimator':
        case 'Accounts':
          return 'admin';
        default: return 'user';
      }
    };

    const mappedRole = mapRoleToDbRole(role);
    console.log("Role mapped:", role, "->", mappedRole);

    // Delete existing invitation
    await supabaseClient
      .from("user_invitations")
      .delete()
      .eq("email", email)
      .eq("invited_by_user_id", user.id);

    // Create new invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from("user_invitations")
      .insert({
        email,
        invited_role: mappedRole,
        invited_by_user_id: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Database error:", inviteError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create invitation", 
          details: inviteError.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invitation created:", invitation);

    // Create invited user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
        email,
        first_name: name.split(' ')[0] || '',
        last_name: name.split(' ').slice(1).join(' ') || '',
        status: 'invited'
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the whole operation if profile creation fails
      console.log("Continuing without profile creation");
    } else {
      console.log("Invited user profile created:", profile);
    }

    // Note: User role will be created when the user signs up and the trigger activates

    // Try to import and use Resend
    try {
      const { Resend } = await import("npm:resend@2.0.0");
      console.log("Resend imported successfully");
      
      const resend = new Resend(resendApiKey);
      console.log("Resend client created");

      const invitationUrl = `${req.headers.get("origin")}/accept-user-invitation?token=${invitation.token}`;
      
      console.log("Sending email with details:", {
        from: "KAKSIK <noreply@skrobaki.com>",
        to: email,
        subject: `You're invited to join KAKSIK as ${role}`,
        invitationUrl
      });
      
      const emailResult = await resend.emails.send({
        from: "KAKSIK <noreply@skrobaki.com>",
        to: [email],
        subject: `You're invited to join KAKSIK as ${role}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>KAKSIK Invitation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Welcome to KAKSIK!</h1>
              <p>Hello ${name},</p>
              <p>You've been invited by ${invitedBy} to join KAKSIK as a <strong>${role}</strong>.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${invitationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${invitationUrl}">${invitationUrl}</a>
              </p>
              <p style="color: #666; font-size: 14px;">
                This invitation will expire in 7 days.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      if (emailResult.error) {
        console.error("Email sending failed:", emailResult.error);
        
        // Check if it's a domain verification issue
        if (emailResult.error.message?.includes("verify a domain")) {
          return new Response(
            JSON.stringify({ 
              error: "Domain verification required", 
              details: "Please verify your domain at resend.com/domains to send emails to other recipients. Currently, you can only send emails to your verified email address.",
              resendError: emailResult.error.message
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Failed to send email", 
            details: emailResult.error.message 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Email sent successfully:", emailResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          invitation, 
          emailId: emailResult.data?.id 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (resendError) {
      console.error("Resend import/usage error:", resendError);
      return new Response(
        JSON.stringify({ 
          error: "Email service error", 
          details: resendError.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);