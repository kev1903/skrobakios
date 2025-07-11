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
    // Check environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log("Environment variables check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
    });
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error",
          details: "Missing required environment variables"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request data first
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data parsed successfully:", Object.keys(requestData));
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format",
          details: "Could not parse JSON body"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, first_name, last_name, role, company, phone } = requestData as CreateUserRequest;
    
    if (!email || !first_name || !last_name || !role) {
      console.error("Missing required fields:", { email: !!email, first_name: !!first_name, last_name: !!last_name, role: !!role });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          details: "email, first_name, last_name, and role are required"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Parsed user creation data:", { 
      email, 
      first_name,
      last_name, 
      role,
      company: !!company,
      phone: !!phone
    });

    // Check authentication header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create clients
    console.log("Creating Supabase clients...");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user authentication
    console.log("Verifying user authentication...");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);

    if (userError || !user) {
      console.error("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ 
          error: "Invalid authorization",
          details: userError?.message || "User not found"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated successfully:", user.id);

    // Check user role
    console.log("Checking user role...");
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Role check failed:", roleError.message);
      return new Response(
        JSON.stringify({ 
          error: "Unable to verify user permissions",
          details: roleError.message
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userRole || userRole.role !== 'superadmin') {
      console.error("User is not superadmin, role:", userRole?.role);
      return new Response(
        JSON.stringify({ 
          error: "Only superadmins can create users directly",
          details: `Current role: ${userRole?.role || 'unknown'}`
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User is superadmin, proceeding with user creation...");

    // Generate a generic password
    const genericPassword = "TempPass123!";

    // Check if user already exists first
    console.log("Checking if user already exists...");
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // This should be enough for most use cases
    });

    if (existingUserError) {
      console.error("Error checking existing users:", existingUserError.message);
      return new Response(
        JSON.stringify({ 
          error: "Failed to check existing users", 
          details: existingUserError.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email already exists
    const emailExists = existingUser?.users?.some(user => user.email === email);
    if (emailExists) {
      console.error("User with email already exists:", email);
      return new Response(
        JSON.stringify({ 
          error: "User already exists", 
          details: `A user with email ${email} already exists in the system` 
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user using admin API
    console.log("Creating user with admin API...");
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: genericPassword,
      email_confirm: true,
      user_metadata: {
        first_name: first_name,
        last_name: last_name
      }
    });

    if (createError) {
      console.error("User creation failed:", createError.message);
      
      // Handle specific error cases
      if (createError.message?.includes("already been registered") || createError.message?.includes("email_exists")) {
        return new Response(
          JSON.stringify({ 
            error: "User already exists", 
            details: `A user with email ${email} already exists in the system` 
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user", 
          details: createError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!newUser.user) {
      console.error("User creation returned no user data");
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user", 
          details: "No user data returned from creation" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created successfully:", newUser.user.id);

    // Create profile
    console.log("Creating user profile...");
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: newUser.user.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        company: company || null,
        phone: phone || null,
        status: 'active',
        needs_password_reset: true
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      // Clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user profile", 
          details: profileError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Profile created successfully");

    // Assign role
    console.log("Assigning user role...");
    const { error: roleAssignError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: role
      });

    if (roleAssignError) {
      console.error("Role assignment failed:", roleAssignError.message);
      // Clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to assign user role", 
          details: roleAssignError.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Role assigned successfully");
    console.log("User creation process completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "User created successfully",
        user: {
          id: newUser.user.id,
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
    console.error("Unexpected error in create-user-direct function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error",
        details: error.message || "Unknown error occurred"
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