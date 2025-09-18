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
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT and get user
    const jwt = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('Invalid token:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ success: false, error: 'Error checking permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userRoles || userRoles.role !== 'superadmin') {
      console.error('Access denied. User role:', userRoles?.role)
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied. Only superadmins can create users.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestBody = await req.json()
    console.log('Request body received:', { ...requestBody, password: '[REDACTED]' })
    
    const { email, password, firstName, lastName, companyId, companyRole, appRole } = requestBody

    if (!email || !password || !firstName || !lastName) {
      console.error('Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName })
      return new Response(
        JSON.stringify({ success: false, error: 'Email, password, first name, and last name are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating user with admin client...')

    // Create or find user
    let createdUserId: string | null = null
    let createdUserEmail: string | null = null
    let createdAt: string | null = null

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      },
      email_confirm: true
    })

    if (createError) {
      console.error('Error creating user:', createError)
      // Handle existing email gracefully
      const code = (createError as any)?.code || (createError as any)?.status
      if (code === 'email_exists' || code === 422) {
        console.log('Email already exists, attempting to link to existing profile by email...')
        const { data: existingProfile, error: findProfileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id, email, created_at')
          .eq('email', email)
          .maybeSingle()

        if (findProfileError) {
          console.error('Failed to lookup existing profile by email:', findProfileError)
          return new Response(
            JSON.stringify({ success: false, code: 'email_exists', error: 'A user with this email already exists.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (existingProfile?.user_id) {
          createdUserId = existingProfile.user_id
          createdUserEmail = existingProfile.email
          createdAt = existingProfile.created_at
          console.log('Using existing user_id from profile:', createdUserId)
        } else {
          return new Response(
            JSON.stringify({ success: false, code: 'email_exists', error: 'A user with this email already exists.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ success: false, error: (createError as any)?.message || 'Failed to create user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      createdUserId = newUser.user?.id || null
      createdUserEmail = newUser.user?.email || email
      createdAt = newUser.user?.created_at || null
    }

    if (createdUserId) {
      console.log('Upserting profile for user:', createdUserId)
      
      // Upsert profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: createdUserId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          status: 'active'
        }, { onConflict: 'user_id' })

      if (profileError) {
        console.error('Profile upsert failed:', profileError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create/update profile: ' + profileError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Profile upserted successfully')
      
      // Determine the app-level role
      const finalAppRole = appRole || (companyRole === 'admin' ? 'business_admin' : 'user')
      console.log('Assigning app role:', finalAppRole)

      // Assign app-level role
      const { error: roleUpsertError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: createdUserId,
          role: finalAppRole
        }, { onConflict: 'user_id,role' })

      if (roleUpsertError) {
        console.error('Role assignment failed:', roleUpsertError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to assign role: ' + roleUpsertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('App role assigned successfully')

      // Add user to company if companyId and companyRole are provided
      if (companyId && companyRole) {
        console.log('Adding user to company:', companyId, 'with role:', companyRole)
        
        const { error: companyMemberError } = await supabaseAdmin
          .from('company_members')
          .upsert({
            company_id: companyId,
            user_id: createdUserId,
            role: companyRole,
            status: 'active'
          }, { onConflict: 'company_id,user_id' })

        if (companyMemberError) {
          console.error('Failed to add user to company:', companyMemberError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to add user to company: ' + companyMemberError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('User added to company successfully')
      }
      
      // Log the action
      try {
        await supabaseAdmin
          .from('user_audit_log')
          .insert({
            user_id: user.id,
            action: 'create_user',
            target_user_id: createdUserId,
            details: {
              email,
              app_role: finalAppRole,
              company_role: companyRole,
              company_id: companyId,
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
            id: createdUserId,
            email: createdUserEmail,
            created_at: createdAt,
            app_role: finalAppRole,
            company_role: companyRole
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.error('User creation returned null user')
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create user - null user returned' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error: ' + (error as any)?.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})