import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";
import { UserInvitationEmail } from "./_templates/user-invitation.tsx";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  name: string;
  role: string;
  invitedBy: string;
  isResend?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Parse request body
    const { email, name, role, invitedBy, isResend = false }: InvitationRequest = await req.json();

    if (!email || !name || !role || !invitedBy) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if user has permission (must be superadmin)
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError || !roles?.some(r => r.role === 'superadmin')) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Map role to database role
    const dbRole = role === 'Super Admin' ? 'superadmin' : 
                   role === 'Platform Admin' ? 'platform_admin' : 'company_admin';

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let invitationId;

    if (isResend) {
      // Update existing invitation
      const { data: existingInvitation, error: updateError } = await supabase
        .from('platform_invitations')
        .update({
          token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .eq('status', 'pending')
        .select('id')
        .single();

      if (updateError) {
        throw new Error(`Failed to update invitation: ${updateError.message}`);
      }

      invitationId = existingInvitation.id;
    } else {
      // Create new invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('platform_invitations')
        .insert({
          email,
          role: dbRole,
          invited_by: user.id,
          token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
          invitation_type: 'platform_access'
        })
        .select('id')
        .single();

      if (invitationError) {
        throw new Error(`Failed to create invitation: ${invitationError.message}`);
      }

      invitationId = invitation.id;
    }

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        status: 'pending',
        account_activated: false,
        password_change_required: true
      }, {
        onConflict: 'email'
      });

    if (profileError) {
      console.warn('Profile creation failed:', profileError);
    }

    // Get email sender from system configurations
    const { data: senderConfig } = await supabase
      .from('system_configurations')
      .select('config_value')
      .eq('config_key', 'email_sender')
      .single();

    const fromEmail = senderConfig?.config_value || 'onboarding@resend.dev';

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Create invitation URL
    const inviteUrl = `${req.headers.get('origin') || 'https://your-domain.com'}/invitation-acceptance?token=${invitationToken}`;

    // Send invitation email
    const emailData = await resend.emails.send({
      from: `KAKSIK Platform <${fromEmail}>`,
      to: [email],
      subject: `You've been invited to join KAKSIK - Modern Task Management`,
      react: UserInvitationEmail({
        name,
        email,
        role,
        invitedBy,
        inviteUrl,
      }),
    });

    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify({
      success: true,
      message: isResend ? 'Invitation resent successfully' : 'Invitation sent successfully',
      invitationId,
      emailId: emailData.data?.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-user-invitation function:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);