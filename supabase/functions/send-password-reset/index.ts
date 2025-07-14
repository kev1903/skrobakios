import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  userEmail: string;
  adminEmail: string;
  resetToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables');
    }

    const { userEmail, adminEmail, resetToken }: PasswordResetRequest = await req.json();

    if (!userEmail || !adminEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Supabase and Resend clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    console.log('Auth header received:', authHeader ? 'present' : 'missing');
    
    // Verify the requesting admin has superadmin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser(token || '');
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Authentication required', details: authError?.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('User authenticated:', user.email);

    // Check if admin is superadmin
    const { data: adminRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('Admin roles:', adminRoles);

    if (roleError || !adminRoles?.some(r => r.role === 'superadmin')) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Insufficient permissions', userRoles: adminRoles }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user profile information
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('email', userEmail)
      .single();

    if (profileError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate password reset link
    console.log('Generating reset link for:', userEmail);
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
      options: {
        redirectTo: `${supabaseUrl.replace('.supabase.co', '')}.lovableproject.com/auth/reset-password`
      }
    });

    if (resetError || !resetData) {
      console.error('Password reset generation error:', resetError);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate reset link', 
        details: resetError?.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Reset link generated successfully');

    // Send password reset email
    console.log('Sending password reset email to:', userEmail);
    const emailResponse = await resend.emails.send({
      from: "System Admin <noreply@system.com>",
      to: [userEmail],
      subject: "Password Reset Request - Admin Initiated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>${userProfile.first_name} ${userProfile.last_name}</strong>,
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              A system administrator has initiated a password reset for your account. This is a security measure to ensure your account remains protected.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;">
              <p style="color: #721c24; margin: 0; font-weight: 600;">
                ⚠️ Security Notice: This password reset was requested by an administrator.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetData.properties?.action_link}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        display: inline-block; 
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Reset Your Password
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #495057; margin: 0; font-size: 14px;">
                <strong>Reset Details:</strong><br>
                • Initiated by: Administrator<br>
                • Account: ${userEmail}<br>
                • Time: ${new Date().toLocaleString()}<br>
                • Link expires in: 24 hours
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              If you didn't expect this password reset, please contact your system administrator immediately. 
              This link will expire in 24 hours for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
              This is an automated security notification. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      return new Response(JSON.stringify({ 
        error: 'Failed to send reset email', 
        details: emailResponse.error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Email sent successfully, ID:', emailResponse.data?.id);

    // Log the admin action
    console.log(`Password reset initiated by admin ${adminEmail} for user ${userEmail}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Password reset email sent successfully',
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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