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

    // Map role - handle both old display names and new database roles
    const mapRoleToDbRole = (role: string): string => {
      console.log("Input role received:", role);
      
      // Valid database roles that can be used directly
      const validDbRoles = [
        'superadmin', 'admin', 'user', 'project_manager', 
        'project_admin', 'consultant', 'subcontractor', 
        'estimator', 'accounts', 'client_viewer'
      ];
      
      // If it's already a valid database role, use it directly
      if (validDbRoles.includes(role)) {
        console.log("Role is already a valid database role:", role);
        return role;
      }
      
      // Legacy mapping for old display names (for backward compatibility)
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
          console.log("Warning: Using legacy 'Admin' role, mapping to 'admin'");
          return 'admin';
        case 'User': 
          console.log("Warning: Using legacy 'User' role, mapping to 'user'");
          return 'user';
        default: 
          console.log("Warning: Unknown role '" + role + "', defaulting to 'user'");
          return 'user';
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

    // Handle profile creation/update
    console.log("Handling profile creation/update...");
    
    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing profile:", profileCheckError);
    }

    if (existingProfile) {
      console.log("Profile already exists, updating status to invited");
      const { data: updatedProfile, error: updateProfileError } = await supabaseClient
        .from("profiles")
        .update({ 
          status: 'invited',
          first_name: name.split(' ')[0] || existingProfile.first_name,
          last_name: name.split(' ').slice(1).join(' ') || existingProfile.last_name,
        })
        .eq("email", email)
        .select()
        .single();

      if (updateProfileError) {
        console.error("Profile update error:", updateProfileError);
      } else {
        console.log("Profile updated successfully:", updatedProfile);
      }
    } else {
      // Create new profile
      console.log("Creating new profile...");
      const { data: newProfile, error: createProfileError } = await supabaseClient
        .from("profiles")
        .insert({
          email,
          first_name: name.split(' ')[0] || '',
          last_name: name.split(' ').slice(1).join(' ') || '',
          status: 'invited'
        })
        .select()
        .single();

      if (createProfileError) {
        console.error("Profile creation error:", createProfileError);
        // Don't fail the whole operation if profile creation fails
        console.log("Continuing without profile creation");
      } else {
        console.log("New profile created successfully:", newProfile);
      }
    }

    // Note: User role will be created when the user signs up and the trigger activates

    // Get current email configuration from database
    const { data: emailConfig } = await supabaseClient
      .from("system_configurations")
      .select("config_value")
      .eq("config_key", "email_sender_address")
      .eq("is_active", true)
      .single();

    const senderEmail = emailConfig?.config_value || 'kevin@skrobaki.com';
    
    // Send email using Resend
    console.log("Attempting to send invitation email...");
    console.log("Email configuration:", {
      hasResendKey: !!resendApiKey,
      recipientEmail: email,
      senderEmail: senderEmail,
      configFromDb: !!emailConfig
    });
    
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Kevin <${senderEmail}>`, // Using configured sender from database
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
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: hsl(222.2, 84%, 4.9%); background-color: hsl(0, 0%, 98%);">
              <div style="max-width: 600px; margin: 40px auto; background-color: hsl(0, 0%, 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid hsl(214.3, 31.8%, 91.4%);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%); padding: 48px 32px; text-align: center;">
                  <h1 style="margin: 0; color: hsl(210, 40%, 98%); font-size: 32px; font-weight: 600; letter-spacing: -0.025em;">Welcome to Our Platform</h1>
                  <p style="margin: 12px 0 0 0; color: hsl(210, 40%, 98%); opacity: 0.9; font-size: 16px;">You're invited to join our team</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 48px 32px;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; padding: 12px 24px; background-color: hsl(210, 40%, 98%); border: 1px solid hsl(214.3, 31.8%, 91.4%); border-radius: 8px; margin-bottom: 24px;">
                      <span style="color: hsl(221.2, 83.2%, 53.3%); font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.025em;">${role} ACCESS</span>
                    </div>
                  </div>
                  
                  <h2 style="margin: 0 0 16px 0; color: hsl(222.2, 84%, 4.9%); font-size: 24px; font-weight: 600;">Hello ${name},</h2>
                  
                  <p style="margin: 0 0 24px 0; font-size: 16px; color: hsl(215.4, 16.3%, 46.9%); line-height: 1.7;">
                    <strong style="color: hsl(222.2, 84%, 4.9%);">${invitedBy}</strong> has invited you to join our platform with <strong style="color: hsl(221.2, 83.2%, 53.3%);">${role}</strong> access.
                  </p>
                  
                  <p style="margin: 0 0 32px 0; font-size: 16px; color: hsl(215.4, 16.3%, 46.9%); line-height: 1.7;">
                    To complete your account setup and start collaborating with the team, click the button below:
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${req.headers.get("origin") || 'https://your-app.com'}/signup?token=${invitation.token}" 
                       style="display: inline-block; background: linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%); color: hsl(210, 40%, 98%); text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.025em; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                       Complete Account Setup
                    </a>
                  </div>
                  
                  <div style="background-color: hsl(210, 40%, 98%); border: 1px solid hsl(214.3, 31.8%, 91.4%); border-radius: 8px; padding: 24px; margin: 32px 0;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: hsl(215.4, 16.3%, 46.9%); font-weight: 500;">
                      If the button doesn't work, copy and paste this link:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: hsl(221.2, 83.2%, 53.3%); word-break: break-all; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;">
                      ${req.headers.get("origin") || 'https://your-app.com'}/signup?token=${invitation.token}
                    </p>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: hsl(210, 40%, 98%); padding: 32px; text-align: center; border-top: 1px solid hsl(214.3, 31.8%, 91.4%);">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: hsl(215.4, 16.3%, 46.9%);">
                    This invitation will expire in 7 days for security purposes.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: hsl(215.4, 16.3%, 46.9%); opacity: 0.8;">
                    If you have questions, contact <strong>${invitedBy}</strong> or your system administrator.
                  </p>
                </div>
              </div>
              
              <!-- Email Footer -->
              <div style="text-align: center; padding: 24px; color: hsl(215.4, 16.3%, 46.9%); font-size: 12px;">
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

        // Log failed email sending
        await supabaseClient
          .from("email_sending_log")
          .insert({
            recipient_email: email,
            sender_email: senderEmail,
            email_type: 'user_invitation',
            status: 'failed',
            error_message: emailError,
            invitation_token: invitation.token,
            created_by: user.id
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
        from: senderEmail,
        to: email,
        status: 'sent',
        resendResponse: emailResult
      });

      // Log successful email sending
      await supabaseClient
        .from("email_sending_log")
        .insert({
          recipient_email: email,
          sender_email: senderEmail,
          email_type: 'user_invitation',
          status: 'sent',
          resend_email_id: emailResult.id,
          invitation_token: invitation.token,
          created_by: user.id
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

      // Log failed email sending
      await supabaseClient
        .from("email_sending_log")
        .insert({
          recipient_email: email,
          sender_email: senderEmail,
          email_type: 'user_invitation',
          status: 'failed',
          error_message: emailError.message,
          invitation_token: invitation.token,
          created_by: user.id
        });
      
      // Return success but mention email issue
      return new Response(
        JSON.stringify({ 
          success: true, 
          invitation,
          emailError: emailError.message,
          message: "User invitation created successfully, but email sending failed. Please notify the user manually.",
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