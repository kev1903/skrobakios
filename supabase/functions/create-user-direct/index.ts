import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE USER DIRECT FUNCTION ===");
  console.log("Method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    const { email, first_name, last_name, role, company, phone } = body;
    
    if (!email || !first_name || !last_name || !role) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: "email, first_name, last_name, and role are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Generate temporary password
    const temporaryPassword = `Temp${Math.random().toString(36).slice(2, 8)}!`;
    
    console.log("Creating user with email:", email);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name,
        last_name
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user account",
          details: authError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          error: "User creation failed",
          details: "No user data returned from auth"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("User created successfully:", authData.user.id);

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        first_name,
        last_name,
        company: company || null,
        phone: phone || null,
        status: 'active',
        needs_password_reset: true
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user profile",
          details: profileError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: role
      });

    if (roleError) {
      console.error("Role creation error:", roleError);
      // Clean up created records
      await supabase.from('profiles').delete().eq('user_id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to assign user role",
          details: roleError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("User creation completed successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "User created successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          first_name,
          last_name,
          role,
          temporary_password: temporaryPassword
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

Deno.serve(handler);