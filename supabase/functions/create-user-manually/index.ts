import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting user creation process...')
    
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verify the JWT and get user
    const jwt = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('Invalid token:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('Authenticated user:', user.email)

    // Check if user is superadmin
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('User roles check:', { userRoles, roleError })

    if (roleError) {
      console.error('Error checking user roles:', roleError)
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!userRoles || userRoles.role !== 'superadmin') {
      console.error('Access denied. User role:', userRoles?.role)
      return new Response(
        JSON.stringify({ error: 'Access denied. Only superadmins can create users.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body received:', { ...requestBody, password: '[REDACTED]' })
    
    const { email, password, firstName, lastName, company, role } = requestBody

    if (!email || !password) {
      console.error('Missing required fields:', { email: !!email, password: !!password })
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Creating user with admin client...')

    // Create user with admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('User created successfully:', newUser.user?.id)

    if (newUser.user) {
      console.log('Creating profile...')
      
      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: newUser.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          company: company,
          status: 'active'
        })

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        // If profile creation fails, delete the auth user
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        return new Response(
          JSON.stringify({ error: 'Failed to create profile: ' + profileError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('Profile created successfully')
      console.log('Assigning role:', role || 'user')

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role || 'user'
        })

      if (roleError) {
        console.error('Role assignment failed:', roleError)
        // If role assignment fails, delete the auth user and profile
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        return new Response(
          JSON.stringify({ error: 'Failed to assign role: ' + roleError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('Role assigned successfully')

      // Log the action
      try {
        await supabaseAdmin
          .from('user_audit_log')
          .insert({
            user_id: user.id,
            action: 'create_user',
            target_user_id: newUser.user.id,
            details: {
              email,
              role: role || 'user',
              created_by: user.email
            }
          })
        console.log('Audit log created')
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError)
        // Don't fail the entire operation for audit log issues
      }

      console.log('User creation process completed successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: {
            id: newUser.user.id,
            email: newUser.user.email,
            created_at: newUser.user.created_at,
            role: role || 'user'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.error('User creation returned null user')
    return new Response(
      JSON.stringify({ error: 'Failed to create user - null user returned' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})