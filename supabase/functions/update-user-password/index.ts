import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create regular client to verify requesting user permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Set the user session for the regular client
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    // Check if requesting user is superadmin
    const { data: isSuperAdmin, error: roleError } = await supabaseAdmin
      .rpc('is_superadmin', { target_user_id: user.id })

    if (roleError) {
      console.error('Error checking superadmin status:', roleError)
      throw new Error('Failed to verify permissions')
    }

    if (!isSuperAdmin) {
      throw new Error('Insufficient permissions - superadmin required')
    }

    const { targetUserId, newPassword } = await req.json()

    if (!targetUserId || !newPassword) {
      throw new Error('Missing required fields: targetUserId and newPassword')
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    console.log('Updating password for user:', targetUserId)

    // Update the user's password using admin client
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    console.log('Password updated successfully for user:', targetUserId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully',
        userId: targetUserId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Update password error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }
})