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

    // Try to import and use Resend
    try {
      const { Resend } = await import("npm:resend@2.0.0");
      console.log("Resend imported successfully");
      
      const resend = new Resend(resendApiKey);
      console.log("Resend client created");

      const invitationUrl = `${req.headers.get("origin")}/accept-invitation?token=${invitation.token}`;
      
      const emailResult = await resend.emails.send({
        from: "KAKSIK <onboarding@resend.dev>",
        to: [email],
        subject: `You're invited to join KAKSIK as ${role}`,
        html: `
          <h1>Welcome to KAKSIK!</h1>
          <p>Hello ${name},</p>
          <p>You've been invited by ${invitedBy} to join KAKSIK as a ${role}.</p>
          <p><a href="${invitationUrl}">Accept Invitation</a></p>
        `,
      });

      if (emailResult.error) {
        console.error("Email sending failed:", emailResult.error);
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