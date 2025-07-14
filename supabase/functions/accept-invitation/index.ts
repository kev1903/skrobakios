import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Parse request body
    const { token, password }: AcceptInvitationRequest = await req.json();

    if (!token || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('platform_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (invitationError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invitation' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create user account
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        invitation_token: token,
        invited_by: invitation.invited_by
      }
    });

    if (createUserError) {
      console.error('User creation error:', createUserError);
      return new Response(JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!newUser.user) {
      return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Update profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        user_id: newUser.user.id,
        status: 'active',
        account_activated: true,
        password_change_required: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', invitation.email);

    if (profileUpdateError) {
      console.warn('Profile update failed:', profileUpdateError);
    }

    // Add user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: invitation.role
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
    }

    // Mark invitation as accepted
    const { error: updateInvitationError } = await supabase
      .from('platform_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateInvitationError) {
      console.warn('Invitation update failed:', updateInvitationError);
    }

    // Generate session for the new user
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: invitation.email,
    });

    if (sessionError) {
      console.warn('Session generation failed:', sessionError);
    }

    console.log('Invitation accepted successfully for:', invitation.email);

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation accepted successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: invitation.role
      },
      redirectUrl: session?.properties?.action_link || '/auth'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in accept-invitation function:', error);

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