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
  isResend?: boolean;
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

    const { email, name, role, invitedBy, isResend = false } = requestData as InvitationRequest & { isResend?: boolean };
    
    console.log("Parsed invitation data:", { 
      email, 
      name, 
      role: `"${role}"`, 
      roleType: typeof role,
      invitedBy,
      isResend: isResend ? "RESEND MODE" : "NEW INVITATION MODE"
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

    let invitation;

    if (isResend) {
      console.log("=== RESEND MODE: Updating existing invitation ===");
      
      // Find and update existing invitation
      const { data: existingInvitation, error: findError } = await supabaseClient
        .from("user_invitations")
        .select("*")
        .eq("email", email)
        .eq("invited_by_user_id", user.id)
        .eq("used_at", null) // Only unused invitations
        .single();

      if (findError || !existingInvitation) {
        console.log("No existing invitation found, creating new one instead");
        // Fallback to creating new invitation if none found
        const { data: newInvitation, error: createError } = await supabaseClient
          .from("user_invitations")
          .insert({
            email,
            invited_role: mappedRole,
            invited_by_user_id: user.id,
          })
          .select()
          .single();

        if (createError) {
          console.error("Database error creating new invitation:", createError);
          return new Response(
            JSON.stringify({ 
              error: "Failed to create invitation", 
              details: createError.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        invitation = newInvitation;
      } else {
        // Update existing invitation with new token and expiry
        const { data: updatedInvitation, error: updateError } = await supabaseClient
          .from("user_invitations")
          .update({
            invited_role: mappedRole, // Update role in case it changed
            token: crypto.randomUUID(), // Generate new token
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // New 7-day expiry
            created_at: new Date().toISOString() // Update resend timestamp
          })
          .eq("id", existingInvitation.id)
          .select()
          .single();

        if (updateError) {
          console.error("Database error updating invitation:", updateError);
          return new Response(
            JSON.stringify({ 
              error: "Failed to update invitation", 
              details: updateError.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        invitation = updatedInvitation;
        console.log("Existing invitation updated:", invitation);
      }
    } else {
      console.log("=== NEW INVITATION MODE: Creating fresh invitation ===");
      
      // Delete existing invitation first for new invitations
      await supabaseClient
        .from("user_invitations")
        .delete()
        .eq("email", email)
        .eq("invited_by_user_id", user.id);

      // Create new invitation
      const { data: newInvitation, error: inviteError } = await supabaseClient
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
      invitation = newInvitation;
    }

    console.log("Final invitation:", invitation);

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
    console.log("Email configuration:", {
      hasResendKey: !!resendApiKey,
      recipientEmail: email,
      senderDomain: "onboarding@resend.dev" // Using Resend's verified domain for testing
    });
    
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Kevin <kevin@skrobaki.com>', // Using Kevin's real email address
          to: [email], // Back to sending to the actual recipient
          subject: 'Welcome - Complete Your Account Setup',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Account Setup</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300;">Welcome to Our Platform</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 400;">Hello ${name},</h2>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555555;">
                    You've been invited by <strong>${invitedBy}</strong> to join our platform with <strong>${role}</strong> access.
                  </p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555;">
                    To complete your account setup and start using the platform, please click the button below:
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${req.headers.get("origin") || 'https://your-app.com'}/accept-user-invitation?token=${invitation.token}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-size: 16px; font-weight: 500; border: none; cursor: pointer; transition: all 0.3s ease;">
                      Complete Account Setup
                    </a>
                  </div>
                  
                  <p style="margin: 30px 0 0 0; font-size: 14px; color: #777777; line-height: 1.5;">
                    If the button doesn't work, you can copy and paste this link into your browser:
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #667eea; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 3px solid #667eea;">
                    ${req.headers.get("origin") || 'https://your-app.com'}/accept-user-invitation?token=${invitation.token}
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #777777;">
                    This invitation will expire in 7 days for security purposes.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    If you have any questions, please contact ${invitedBy} or your system administrator.
                  </p>
                </div>
              </div>
              
              <!-- Email Footer -->
              <div style="text-align: center; padding: 20px; color: #999999; font-size: 12px;">
                <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.error("Failed to send email. Status:", emailResponse.status);
        console.error("Email error response:", emailError);
        console.error("Request details:", {
          url: 'https://api.resend.com/emails',
          method: 'POST',
          hasAuth: !!resendApiKey,
          keyPrefix: resendApiKey ? resendApiKey.substring(0, 8) + '...' : 'none'
        });
        
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
      console.log("Email sent successfully. FULL RESPONSE:", {
        emailId: emailResult.id,
        from: 'info@skrobaki.com',
        to: email,
        status: 'sent',
        resendResponse: emailResult
      });
      
      // Let's try to get delivery info if available
      if (emailResult.id) {
        console.log("EMAIL SUCCESSFULLY QUEUED FOR DELIVERY with ID:", emailResult.id);
        console.log("Check Resend dashboard for delivery status:", `https://resend.com/emails/${emailResult.id}`);
      }
      
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