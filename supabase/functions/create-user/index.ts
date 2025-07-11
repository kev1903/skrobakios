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
  console.log('create-user function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { email, first_name, last_name, company, phone, role }: CreateUserRequest = requestBody;

    // Validate required fields
    if (!email || !first_name || !last_name) {
      console.log('Validation failed: missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email, first name, and last name are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate a more robust temporary password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let tempPassword = '';
    for (let i = 0; i < 12; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    console.log('Creating user with email:', email);
    console.log('Temporary password generated');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    if (existingUser.user) {
      console.log('User already exists');
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

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

    if (!authUser.user) {
      console.error('No user returned from auth creation');
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('User created in auth:', authUser.user.id);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
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
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      } catch (deleteError) {
        console.error('Failed to cleanup auth user:', deleteError);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile: ' + profileError.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create user role
    const validRoles = ['superadmin', 'admin', 'user', 'project_manager', 'project_admin', 'consultant', 'subcontractor', 'estimator', 'accounts', 'client_viewer'];
    const roleToSave = validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'user';
    
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: roleToSave
      });

    if (roleError) {
      console.error('Role error:', roleError);
      // Don't fail the whole operation if role assignment fails
      console.log('User created but role assignment failed, defaulting to user role');
    }

    console.log('User created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        tempPassword,
        user: {
          id: authUser.user.id,
          email: authUser.user.email
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
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);