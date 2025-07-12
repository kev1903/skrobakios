import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteUserRequest {
  email: string;
  company_id?: string;
  role?: 'owner' | 'admin' | 'member';
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, company_id, role = 'member' }: InviteUserRequest = await req.json();

    // Get the current user making the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid user");
    }

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw new Error(`Error checking user: ${userError.message}`);
    }

    let invitedUserId: string;
    let isNewUser = false;

    if (existingUser) {
      invitedUserId = existingUser.user_id;
    } else {
      // Create a new user invitation
      const { data: authData, error: createError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            invited_by: user.id,
            company_id: company_id,
            role: role
          },
          redirectTo: `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify`
        }
      );

      if (createError) {
        throw new Error(`Error creating user invitation: ${createError.message}`);
      }

      invitedUserId = authData.user?.id!;
      isNewUser = true;
    }

    // If company_id is provided, add user to company
    if (company_id && invitedUserId) {
      const { error: memberError } = await supabase
        .from('company_members')
        .upsert({
          company_id: company_id,
          user_id: invitedUserId,
          role: role,
          status: isNewUser ? 'invited' : 'active'
        }, {
          onConflict: 'user_id,company_id'
        });

      if (memberError) {
        console.error('Error adding user to company:', memberError);
        // Don't throw here as the user invitation was successful
      }
    }

    // Get company name if company_id is provided
    let companyName = '';
    if (company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', company_id)
        .single();
      
      companyName = company?.name || 'the company';
    }

    // Send email notification
    const emailSubject = isNewUser 
      ? `You've been invited to join ${companyName || 'our platform'}`
      : `You've been added to ${companyName || 'a new company'}`;

    const emailHtml = isNewUser 
      ? `
        <h1>Welcome to our platform!</h1>
        <p>You've been invited to join ${companyName || 'our platform'} as a ${role}.</p>
        <p>Please check your email for the invitation link to complete your registration.</p>
        <p>Best regards,<br>The Team</p>
      `
      : `
        <h1>You've been added to ${companyName}!</h1>
        <p>You've been added to ${companyName} as a ${role}.</p>
        <p>You can now access the company dashboard with your existing account.</p>
        <p>Best regards,<br>The Team</p>
      `;

    try {
      await resend.emails.send({
        from: "Platform <onboarding@resend.dev>",
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the entire request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? "User invitation sent successfully" : "User added to company successfully",
        user_id: invitedUserId,
        is_new_user: isNewUser
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);