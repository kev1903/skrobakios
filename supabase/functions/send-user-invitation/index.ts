import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateUserInvitationEmail } from "./_templates/user-invitation.tsx";

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('Environment check:', {
      hasResendKey: !!resendApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey
    });

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Missing environment variables:', {
        resendApiKey: !!resendApiKey,
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
        supabaseAnonKey: !!supabaseAnonKey
      });
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse request body
    const { email, name, role, invitedBy, isResend = false }: InvitationRequest = await req.json();

    console.log('Request received:', {
      email: email?.substring(0, 3) + '***', // Partial email for privacy
      name,
      role,
      invitedBy,
      isResend
    });

    if (!email || !name || !role || !invitedBy) {
      console.error('Missing required fields:', { email: !!email, name: !!name, role: !!role, invitedBy: !!invitedBy });
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

    // Create regular client to verify current user permissions
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
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

    console.log('User roles check:', { roles, roleError, userId: user.id });

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify permissions' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const hasSuperadminRole = roles?.some(r => r.role === 'superadmin');
    if (!hasSuperadminRole) {
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

    // Check if user already exists in profiles using admin client
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, status')
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

    let profile;
    if (existingProfile) {
      // Update existing profile using admin client
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          status: 'invited',
          account_activated: false,
          password_change_required: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      profile = updatedProfile;
    } else {
      // Generate a unique slug
      const baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      let uniqueSlug = baseSlug;
      let counter = 1;
      let maxAttempts = 10;
      
      // Check for slug uniqueness and append number if needed
      while (counter <= maxAttempts) {
        const { data: existingSlugProfile, error: slugCheckError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('slug', uniqueSlug)
          .maybeSingle();
          
        if (slugCheckError) {
          console.error('Slug check error:', slugCheckError);
          throw new Error(`Failed to check slug uniqueness: ${slugCheckError.message}`);
        }
          
        if (!existingSlugProfile) {
          break;
        }
        
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      if (counter > maxAttempts) {
        // Fallback to timestamp-based slug
        uniqueSlug = `${baseSlug}-${Date.now()}`;
      }

      console.log('Generated unique slug:', uniqueSlug);

      // Create new profile using admin client
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          email,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          slug: uniqueSlug,
          status: 'invited',
          account_activated: false,
          password_change_required: true
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Profile insert error:', insertError);
        
        // If it's still a slug constraint error, try with timestamp
        if (insertError.code === '23505' && insertError.message.includes('profiles_slug_key')) {
          const timestampSlug = `${baseSlug}-${Date.now()}`;
          console.log('Retrying with timestamp slug:', timestampSlug);
          
          const { data: retryProfile, error: retryError } = await supabaseAdmin
            .from('profiles')
            .insert({
              email,
              first_name: name.split(' ')[0] || name,
              last_name: name.split(' ').slice(1).join(' ') || '',
              slug: timestampSlug,
              status: 'invited',
              account_activated: false,
              password_change_required: true
            })
            .select('id')
            .single();
            
          if (retryError) {
            console.error('Retry profile insert error:', retryError);
            throw new Error(`Failed to create profile after retry: ${retryError.message}`);
          }
          profile = retryProfile;
        } else {
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      } else {
        profile = newProfile;
      }
    }

    // Create invitation link directly without storing tokens since invited users don't have auth user_id yet
    // We'll store the token in a different way or not at all since the profile status serves as the invitation state
    
    console.log('Profile created/updated successfully:', profile.id);

    // Get email sender from system configurations using admin client
    const { data: senderConfig } = await supabaseAdmin
      .from('system_configurations')
      .select('config_value')
      .eq('config_key', 'email_sender')
      .maybeSingle();

    const fromEmail = senderConfig?.config_value || 'noreply@skrobaki.com';

    // Create invitation URL - point to signup page with token  
    const inviteUrl = `${req.headers.get('origin') || 'https://your-domain.com'}/auth?token=${invitationToken}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(dbRole)}`;

    console.log('Preparing to send email:', {
      to: email,
      from: `Platform <${fromEmail}>`,
      inviteUrl,
      name,
      role,
      invitedBy
    });

    // Generate HTML email content (using the existing template function)
    const htmlContent = generateUserInvitationEmail({
      name,
      email,
      role,
      invitedBy,
      inviteUrl,
      companyName: invitedBy
    });

    // Send email via Resend API
    const emailPayload = {
      from: `Platform <${fromEmail}>`,
      to: [email],
      subject: `You're invited to join ${typeof invitedBy === 'string' ? invitedBy : (invitedBy as any).first_name || 'a team'}`,
      html: htmlContent
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} ${errorText}`);
    }

    const emailResult = await response.json();

    console.log('✅ Email sent successfully:', emailResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully',
      profileId: profile.id,
      emailId: emailResult.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error sending invitation:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send invitation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
          to: [email],
          subject: `You've been invited to join the Platform`,
          html: htmlContent,
        }),
      });

      const emailData = await emailResponse.json();

      console.log('Email sent successfully:', emailData);
      
      if (!emailResponse.ok || emailData.error) {
        console.error('Resend returned an error:', emailData.error || emailData);
        throw new Error(`Email sending failed: ${emailData.error?.message || 'Unknown error'}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        profileId: profile.id,
        emailId: emailData.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      throw new Error(`Failed to send invitation email: ${emailError.message}`);
    }

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