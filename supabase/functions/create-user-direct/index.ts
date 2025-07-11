import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company?: string;
  phone?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE USER DIRECT FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Environment variables check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error",
          details: "Missing required environment variables"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request data
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data received:", requestData);
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
    
    console.log("Creating user with data:", { 
      email, 
      first_name,
      last_name, 
      role
    });

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a generic password
    const genericPassword = "TempPass123!";

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
      console.error("User creation failed:", createError);
      
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

    // Update the profile (created by trigger) with additional data
    console.log("Updating user profile...");
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: first_name,
        last_name: last_name,
        email: email,
        company: company || null,
        phone: phone || null,
        status: 'active',
        needs_password_reset: true
      })
      .eq('user_id', newUser.user.id);

    if (profileError) {
      console.error("Profile update failed:", profileError.message);
    } else {
      console.log("Profile updated successfully");
    }

    // Update the role (created by trigger) to the desired role
    console.log("Updating user role to:", role);
    const { error: roleUpdateError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: role })
      .eq('user_id', newUser.user.id);

    if (roleUpdateError) {
      console.error("Role update failed:", roleUpdateError.message);
      return new Response(
        JSON.stringify({ 
          error: "Failed to assign user role", 
          details: roleUpdateError.message 
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