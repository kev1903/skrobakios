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
                   role === 'Business Admin' ? 'business_admin' :
                   role === 'Project Admin' ? 'project_admin' :
                   role === 'User' ? 'user' :
                   role === 'Client' ? 'client' : 'user';

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Check if user already exists in profiles
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('user_id, status')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile?.status === 'active') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User already has an active account' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create or update profile with invited status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        status: 'invited',
        account_activated: false,
        password_change_required: true
      }, {
        onConflict: 'email'
      })
      .select('id')
      .single();

    if (profileError) {
      throw new Error(`Failed to create/update profile: ${profileError.message}`);
    }

    // Store invitation details in a simple way using user access tokens table
    const { error: tokenError } = await supabase
      .from('user_access_tokens')
      .upsert({
        user_id: profile.id,
        token: invitationToken,
        token_type: 'invitation',
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'user_id,token_type'
      });

    if (tokenError) {
      console.warn('Token creation failed:', tokenError);
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

    // Create invitation URL - point to signup page with token
    const inviteUrl = `${req.headers.get('origin') || 'https://your-domain.com'}/auth?token=${invitationToken}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(dbRole)}`;

    // Send invitation email
    const emailData = await resend.emails.send({
      from: `Platform <${fromEmail}>`,
      to: [email],
      subject: `You've been invited to join the Platform`,
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
      message: 'Invitation sent successfully',
      profileId: profile.id,
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