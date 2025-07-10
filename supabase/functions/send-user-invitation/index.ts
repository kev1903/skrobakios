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
    console.log("Raw request data received:", requestData);

    const { email, name, role, invitedBy } = requestData as InvitationRequest;
    
    console.log("Parsed invitation data:", { 
      email, 
      name, 
      role: `"${role}"`, 
      roleType: typeof role,
      invitedBy 
    });

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

    // Check if user has permission to send invitations (superadmin only)
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole) {
      console.error("Failed to get user role:", roleError);
      return new Response(
        JSON.stringify({ error: "Unable to verify user permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User role:", userRole.role);

    if (userRole.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ error: "Only superadmins can send user invitations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map role - using the same mapping as frontend
    const mapRoleToDbRole = (role: string): string => {
      console.log("Input role received:", role);
      switch (role) {
        case 'Super Admin': 
          return 'superadmin';
        case 'Project Manager': 
          return 'project_manager';
        case 'Consultant': 
          return 'consultant';
        case 'SubContractor': 
          return 'subcontractor';
        case 'Accounts': 
          return 'accounts';
        case 'Client Viewer': 
          return 'client_viewer';
        // Legacy mappings for backward compatibility
        case 'Admin': 
          console.log("Warning: Using legacy 'Admin' role, mapping to 'project_manager'");
          return 'project_manager';
        case 'User': 
          console.log("Warning: Using legacy 'User' role, mapping to 'client_viewer'");
          return 'client_viewer';
        default: 
          console.log("Warning: Unknown role '" + role + "', defaulting to 'client_viewer'");
          return 'client_viewer';
      }
    };

    const mappedRole = mapRoleToDbRole(role);
    console.log("Role mapping completed:", role, "->", mappedRole);

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

    // Send email using Resend
    console.log("Attempting to send invitation email...");
    
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'System <noreply@yourdomain.com>',
          to: [email],
          subject: 'You\'ve been invited to join our platform',
          html: `
            <h1>Welcome ${name}!</h1>
            <p>You've been invited by ${invitedBy} to join our platform with the role of <strong>${role}</strong>.</p>
            <p>Please click the link below to complete your registration:</p>
            <a href="${req.headers.get("origin") || 'https://your-app.com'}/accept-user-invitation?token=${invitation.token}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Accept Invitation
            </a>
            <p>This invitation will expire in 7 days.</p>
            <p>If you have any questions, please contact your administrator.</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.error("Failed to send email:", emailError);
        
        // Return success but mention email issue
        return new Response(
          JSON.stringify({ 
            success: true, 
            invitation,
            message: `User invitation created successfully, but email sending failed: ${emailError}. Please notify the user manually.`,
            invitationUrl: `${req.headers.get("origin")}/accept-user-invitation?token=${invitation.token}`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailResult = await emailResponse.json();
      console.log("Email sent successfully:", emailResult);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          invitation,
          emailResult,
          message: "User invitation created and email sent successfully!",
          invitationUrl: `${req.headers.get("origin")}/accept-user-invitation?token=${invitation.token}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      
      // Return success but mention email issue
      return new Response(
        JSON.stringify({ 
          success: true, 
          invitation,
          message: `User invitation created successfully, but email sending failed: ${emailError}. Please notify the user manually.`,
          invitationUrl: `${req.headers.get("origin")}/accept-user-invitation?token=${invitation.token}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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