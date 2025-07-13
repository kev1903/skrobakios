import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId?: string;
  companyRole: 'owner' | 'admin' | 'member';
  platformRole: 'superadmin' | 'platform_admin' | 'company_admin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the requesting user is a superadmin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is superadmin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError || !userRoles?.some(r => r.role === 'superadmin')) {
      throw new Error('Insufficient permissions - superadmin required');
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      companyId, 
      companyRole, 
      platformRole 
    }: CreateUserRequest = await req.json();

    console.log('Creating user with data:', { firstName, lastName, email, companyId, companyRole, platformRole });

    // Validation
    if (!firstName || !lastName || !email || !password) {
      console.error('Missing required fields');
      throw new Error('Missing required fields');
    }

    // Create the user account using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      },
      email_confirm: true // Auto-confirm email for manually created users
    });

    if (createError) {
      // Check if it's a duplicate email error
      if (createError.message.includes('already been registered') || createError.message.includes('User already registered')) {
        throw new Error(`A user with email ${email} already exists. Please use a different email address.`);
      }
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('User created successfully:', newUser.user.id);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        status: 'active'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Try to clean up the user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    console.log('Profile created successfully');

    // Delete any existing role entries for this user (in case of conflicts)
    const { error: deleteRoleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', newUser.user.id);

    if (deleteRoleError) {
      console.log('No existing roles to delete (expected):', deleteRoleError.message);
    }

    // Assign platform role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: platformRole
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Try to clean up the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to assign platform role: ${roleError.message}`);
    } else {
      console.log('Platform role assigned:', platformRole);
    }

    // Assign to company if specified
    if (companyId) {
      const { error: companyError } = await supabaseAdmin
        .from('company_members')
        .insert({
          user_id: newUser.user.id,
          company_id: companyId,
          role: companyRole,
          status: 'active'
        });

      if (companyError) {
        console.error('Error assigning to company:', companyError);
        // Continue with creation but log the error
      } else {
        console.log('Company assignment completed:', companyId, companyRole);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id, // Changed from userId to user_id to match what frontend expects
        message: 'User created successfully'
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
    console.error("Error in create-user-manually function:", error);
    
    // More detailed error logging
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false,
        details: error.stack // Include stack trace for debugging
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);