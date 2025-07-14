import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  projectId: string;
  email: string;
  role: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { projectId, email, role, message }: InviteRequest = await req.json();

    // Validate inputs
    if (!projectId || !email || !role) {
      throw new Error("Missing required fields");
    }

    // Verify user has permission to invite to this project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        id, name, company_id,
        company_members!inner(user_id, role, status)
      `)
      .eq("id", projectId)
      .eq("company_members.user_id", user.id)
      .eq("company_members.status", "active")
      .single();

    if (projectError || !project) {
      throw new Error("Project not found or access denied");
    }

    // Check if user has admin rights (company owner/admin or project admin)
    const hasAdminRights = project.company_members.some((member: any) => 
      member.user_id === user.id && ['owner', 'admin'].includes(member.role)
    );

    if (!hasAdminRights) {
      // Check if user is project admin
      const { data: projectMember } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!projectMember || projectMember.role !== "project_admin") {
        throw new Error("Insufficient permissions to invite team members");
      }
    }

    // Check if email is already invited or is a member
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("id, status")
      .eq("project_id", projectId)
      .eq("email", email)
      .single();

    if (existingMember) {
      if (existingMember.status === "active") {
        throw new Error("User is already a team member");
      } else {
        throw new Error("User already has a pending invitation");
      }
    }

    // Generate invitation token
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from("project_invitations")
      .insert({
        project_id: projectId,
        email: email,
        role: role,
        invited_by: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        message: message,
      })
      .select()
      .single();

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    // Get inviter profile for email
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("user_id", user.id)
      .single();

    const inviterName = inviterProfile 
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`.trim()
      : inviterProfile?.email || "Team Admin";

    // Create invitation URL
    const baseUrl = req.headers.get("origin") || "https://your-app.com";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "BuildTrack <noreply@buildtrack.app>",
      to: [email],
      subject: `You're invited to join ${project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Project Team Invitation</h2>
          <p>Hi there!</p>
          <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${project.name}"</strong> as a <strong>${role}</strong>.</p>
          
          ${message ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Message from ${inviterName}:</strong></p>
            <p>${message}</p>
          </div>` : ""}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            This invitation will expire in 7 days. If you don't have an account, you'll be prompted to create one.
          </p>
          
          <p style="font-size: 12px; color: #999;">
            If the button doesn't work, copy and paste this link: ${inviteUrl}
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        token: token,
        expiresAt: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in invite-project-member function:", error);
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