import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name, last_name, company, phone, role }: CreateUserRequest = await req.json();

    // Validate required fields
    if (!email || !first_name || !last_name) {
      return new Response(
        JSON.stringify({ error: 'Email, first name, and last name are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate a temporary password (8 characters, mix of letters and numbers)
    const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => String.fromCharCode(97 + (b % 26))) // Generate random letters
      .join('') + Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Add numbers

    console.log('Creating user with email:', email);
    console.log('Temporary password generated:', tempPassword);

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create user in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        first_name,
        last_name
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('User created in auth:', authUser.user?.id);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user!.id,
        first_name,
        last_name,
        email,
        company: company || null,
        phone: phone || null,
        status: 'active'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user!.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create user role
    const validRoles = ['superadmin', 'admin', 'user', 'project_manager', 'project_admin', 'consultant', 'subcontractor', 'estimator', 'accounts', 'client_viewer'];
    const roleToSave = validRoles.includes(role) ? role : 'user';
    
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user!.id,
        role: roleToSave
      });

    if (roleError) {
      console.error('Role error:', roleError);
      // Don't fail the whole operation if role assignment fails, just log it
      console.log('Continuing without role assignment');
    }

    console.log('User created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        tempPassword,
        user: {
          id: authUser.user!.id,
          email: authUser.user!.email
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);