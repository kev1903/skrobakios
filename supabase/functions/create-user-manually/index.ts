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
    console.log('=== STARTING USER CREATION PROCESS (LATEST VERSION) ===')
    
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

    console.log('1. Admin client created successfully')

    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      console.error('ERROR: No authorization header provided')
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('2. Authorization header present')

    // Verify the JWT and get user
    const jwt = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('ERROR: Invalid token:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token: ' + (authError?.message || 'No user found') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('3. User authenticated:', user.email)

    // Check if user is superadmin
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('4. User roles check:', { userRoles, roleError })

    if (roleError) {
      console.error('ERROR: Error checking user roles:', roleError)
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking permissions: ' + roleError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userRoles || userRoles.role !== 'superadmin') {
      console.error('ERROR: Access denied. User role:', userRoles?.role)
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied. Only superadmins can create users.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('5. Permissions verified - user is superadmin')

    // Parse request body
    const requestBody = await req.json()
    console.log('6. Request body received:', { ...requestBody, password: '[REDACTED]' })
    
    const { email, password, firstName, lastName, companyId, companyRole, appRole } = requestBody

    if (!email || !password || !firstName) {
      console.error('ERROR: Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName })
      return new Response(
        JSON.stringify({ success: false, error: 'Email, password, and first name are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('7. Input validation passed')

    // Check if user already exists
    console.log('8. Checking if user already exists...')
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.auth.admin.listUsers()
    console.log('9. Existing users check:', { count: existingUser?.users?.length, error: existingUserError })
    
    const userExists = existingUser?.users?.find(u => u.email === email)
    if (userExists) {
      console.log('10. User already exists with email:', email)
      return new Response(
        JSON.stringify({ success: false, error: 'A user with this email already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('11. User does not exist, proceeding with creation...')

    // Create user with minimal approach
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName.trim(),
        last_name: (lastName || '').trim()
      }
    })

    console.log('12. User creation attempt completed:', { 
      success: !!newUser?.user, 
      userId: newUser?.user?.id,
      error: createError?.message 
    })

    if (createError) {
      console.error('ERROR: User creation failed:', createError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create user: ' + createError.message,
          details: createError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!newUser?.user?.id) {
      console.error('ERROR: User creation returned no user ID')
      return new Response(
        JSON.stringify({ success: false, error: 'User creation failed - no user ID returned' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const createdUserId = newUser.user.id
    console.log('13. User created successfully with ID:', createdUserId)

    // Check if profile already exists (likely created by trigger) and update if needed
    console.log('14. Checking/updating profile entry...')
    
    // First check if profile exists
    const { data: existingProfile, error: checkProfileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, first_name, last_name')
      .eq('user_id', createdUserId)
      .maybeSingle()

    if (checkProfileError) {
      console.error('ERROR: Failed to check existing profile:', checkProfileError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check profile: ' + checkProfileError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingProfile) {
      console.log('15. Profile already exists (created by trigger), updating with user data...')
      
      // Update the existing profile with the provided data
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: (lastName || '').trim(),
          status: 'active'
        })
        .eq('user_id', createdUserId)

      if (updateError) {
        console.error('ERROR: Profile update failed:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update profile: ' + updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('16. Profile updated successfully')
    } else {
      console.log('15. No existing profile found, creating new one...')
      
      // Create new profile
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: createdUserId,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: (lastName || '').trim(),
          status: 'active'
        })

      if (createProfileError) {
        console.error('ERROR: Profile creation failed:', createProfileError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create profile: ' + createProfileError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('16. Profile created successfully')
    }

    // Assign app-level role
    const finalAppRole = appRole || (companyRole === 'admin' ? 'business_admin' : 'user')
    console.log('17. Assigning app role:', finalAppRole)

    // Check if role already exists (might be created by trigger) and handle accordingly
    const { data: existingRole, error: checkRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', createdUserId)
      .maybeSingle()

    if (checkRoleError) {
      console.error('ERROR: Failed to check existing role:', checkRoleError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to check role: ' + checkRoleError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingRole) {
      console.log('18. Role already exists, updating to desired role...')
      
      // Update the existing role
      const { error: updateRoleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: finalAppRole })
        .eq('user_id', createdUserId)

      if (updateRoleError) {
        console.error('ERROR: Role update failed:', updateRoleError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update role: ' + updateRoleError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('19. App role updated successfully')
    } else {
      console.log('18. No existing role found, creating new one...')
      
      // Create new role
      const { error: roleError2 } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: createdUserId,
          role: finalAppRole
        })

      if (roleError2) {
        console.error('ERROR: Role assignment failed:', roleError2)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to assign role: ' + roleError2.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('19. App role assigned successfully')
    }

    // Add to company if specified
    if (companyId && companyRole) {
      console.log('20. Adding user to company:', companyId, 'with role:', companyRole)
      
      // First check if the user is already a member of this company
      const { data: existingMember, error: checkMemberError } = await supabaseAdmin
        .from('company_members')
        .select('id, role, status')
        .eq('company_id', companyId)
        .eq('user_id', createdUserId)
        .maybeSingle()

      if (checkMemberError) {
        console.error('ERROR: Failed to check existing company membership:', checkMemberError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to check company membership: ' + checkMemberError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (existingMember) {
        console.log('21. User is already a member, updating role and status...')
        
        // Update existing membership
        const { error: updateMemberError } = await supabaseAdmin
          .from('company_members')
          .update({
            role: companyRole,
            status: 'active'
          })
          .eq('id', existingMember.id)

        if (updateMemberError) {
          console.error('ERROR: Failed to update company membership:', updateMemberError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update company membership: ' + updateMemberError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('22. Company membership updated successfully')
      } else {
        console.log('21. User is not a member, creating new membership...')
        
        // Create new membership
        const { error: companyMemberError } = await supabaseAdmin
          .from('company_members')
          .insert({
            company_id: companyId,
            user_id: createdUserId,
            role: companyRole,
            status: 'active'
          })

        if (companyMemberError) {
          console.error('ERROR: Failed to add user to company:', companyMemberError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to add user to company: ' + companyMemberError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('22. User added to company successfully')
      }
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
      console.log('22. Audit log created')
    } catch (auditError) {
      console.error('WARNING: Failed to create audit log:', auditError)
      // Don't fail the entire operation for audit log issues
    }

    console.log('=== USER CREATION COMPLETED SUCCESSFULLY ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: createdUserId,
          email: email,
          created_at: newUser.user.created_at,
          app_role: finalAppRole,
          company_role: companyRole
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('FATAL ERROR:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error: ' + (error as any)?.message,
        stack: (error as any)?.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})