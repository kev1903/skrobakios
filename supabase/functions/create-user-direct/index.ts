import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company?: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE USER DIRECT FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("Supabase client created successfully");

    // Parse request data
    const requestData = await req.json();
    console.log("Raw request data received:", requestData);

    const { email, first_name, last_name, role, company, phone } = requestData as CreateUserRequest;
    
    console.log("Parsed user creation data:", { 
      email, 
      first_name,
      last_name, 
      role,
      company,
      phone
    });

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the calling user is a superadmin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authentication successful for user:", user.id);

    // Check if user has permission to create users (superadmin only)
    const { data: userRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole) {
      return new Response(
        JSON.stringify({ error: "Unable to verify user permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User role:", userRole.role);

    if (userRole.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ error: "Only superadmins can create users directly" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a generic password (can be changed later)
    const genericPassword = "TempPass123!";

    console.log("Creating new user with generic password...");

    // Create the user using admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: genericPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: first_name,
        last_name: last_name
      }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user", 
          details: createError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created successfully:", newUser.user?.id);

    // Create profile with password reset flag
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert([{
        user_id: newUser.user!.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        company: company,
        phone: phone,
        status: 'active',
        needs_password_reset: true
      }]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Clean up the created user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(newUser.user!.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user profile", 
          details: profileError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign role to the user
    const { error: roleAssignError } = await supabaseClient
      .from("user_roles")
      .insert([{
        user_id: newUser.user!.id,
        role: role
      }]);

    if (roleAssignError) {
      console.error("Error assigning role:", roleAssignError);
      // Clean up the created user if role assignment fails
      await supabaseClient.auth.admin.deleteUser(newUser.user!.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to assign user role", 
          details: roleAssignError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User creation process completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "User created successfully",
        user: {
          id: newUser.user!.id,
          email: email,
          first_name: first_name,
          last_name: last_name,
          role: role,
          temporary_password: genericPassword
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
    console.error("Error in create-user-direct function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

Deno.serve(handler);