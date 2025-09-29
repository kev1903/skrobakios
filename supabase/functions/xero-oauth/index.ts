import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OAuth callback from Xero (GET request)
async function handleOAuthCallback(req: Request) {
  console.log('🔄 Processing GET request (OAuth callback) - NO AUTH CHECK')
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    console.log('📋 Callback params:', { hasCode: !!code, hasState: !!state, error })

    if (error) {
      console.error('❌ OAuth error from Xero:', error)
      return new Response(`
        <html>
          <body>
            <h1>Authentication Error</h1>
            <p>Error: ${error}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage('xero-auth-error', '*');
                window.close();
              } else {
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    if (!code || !state) {
      console.error('❌ Missing code or state parameter')
      return new Response(`
        <html>
          <body>
            <h1>Authentication Error</h1>
            <p>Missing required parameters</p>
            <script>
              if (window.opener) {
                window.opener.postMessage('xero-auth-error', '*');
                window.close();
              } else {
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    console.log('🔍 Verifying OAuth state...')
    
    // Verify state and get user_id
    const { data: stateRecord, error: stateError } = await supabase
      .from('xero_oauth_states')
      .select('user_id')
      .eq('state', state)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle()

    console.log('🔍 State query result:', { stateRecord, stateError })

    if (stateError) {
      console.error('❌ Database error checking state:', stateError)
      throw new Error(`Database error: ${stateError.message}`)
    }
    
    if (!stateRecord) {
      console.error('❌ Invalid or expired state - no matching record found')
      return new Response(`
        <html>
          <body>
            <h1>Authentication Error</h1>
            <p>Invalid or expired authentication state</p>
            <script>
              if (window.opener) {
                window.opener.postMessage('xero-auth-error', '*');
                window.close();
              } else {
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    console.log('✅ State verified for user:', stateRecord.user_id)

    // Get Xero credentials
    const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
    const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')
    const xeroRedirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/xero-oauth`

    if (!xeroClientId || !xeroClientSecret) {
      console.error('❌ Missing Xero credentials')
      throw new Error('Xero credentials not configured')
    }

    console.log('🔄 Exchanging code for tokens...')

    // Exchange code for tokens
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${xeroClientId}:${xeroClientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: xeroRedirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()
    console.log('✅ Token response received:', JSON.stringify(tokens, null, 2))
    console.log('🔍 Token fields available:', Object.keys(tokens))
    console.log('🔍 Access token present:', !!tokens.access_token)
    console.log('🔍 Refresh token present:', !!tokens.refresh_token)
    console.log('🔍 Refresh token value:', tokens.refresh_token)

    // Validate required tokens
    if (!tokens.access_token) {
      console.error('❌ No access token in response')
      throw new Error('No access token received from Xero')
    }

    if (!tokens.refresh_token) {
      console.error('❌ No refresh token in response')
      console.error('❌ Full token response:', JSON.stringify(tokens, null, 2))
      throw new Error('No refresh token received from Xero - this is required for maintaining the connection')
    }

    // Get tenant information
    console.log('🔄 Fetching tenant info...')
    const connectionsResponse = await fetch('https://api.xero.com/connections', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })

    if (!connectionsResponse.ok) {
      console.error('❌ Failed to fetch tenant info:', await connectionsResponse.text())
      throw new Error('Failed to get tenant information from Xero')
    }

    const connections = await connectionsResponse.json()
    console.log('✅ Tenant info received:', connections[0]?.tenantName)
    console.log('🔍 Tenant details:', JSON.stringify(connections[0], null, 2))

    if (!connections || connections.length === 0) {
      console.error('❌ No Xero organizations found')
      throw new Error('No Xero organizations found for this account')
    }

    // Store tokens and connection info
    console.log('💾 Storing connection data...')
    console.log('🔍 About to store:', {
      user_id: stateRecord.user_id,
      has_access_token: !!tokens.access_token,
      has_refresh_token: !!tokens.refresh_token,
      refresh_token_length: tokens.refresh_token?.length || 0,
      expires_in: tokens.expires_in,
      tenant_id: connections[0]?.tenantId,
      tenant_name: connections[0]?.tenantName
    })
    
    const { error: insertError } = await supabase
      .from('xero_connections')
      .upsert({
        user_id: stateRecord.user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in || 1800) * 1000).toISOString(),
        tenant_id: connections[0]?.tenantId,
        tenant_name: connections[0]?.tenantName,
        connected_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (insertError) {
      console.error('❌ Failed to store connection:', insertError)
      throw insertError
    }

    // Clean up state
    await supabase
      .from('xero_oauth_states')
      .delete()
      .eq('state', state)

    console.log('🎉 OAuth flow completed successfully!')

    // Close popup window
    return new Response(`
      <html>
        <body>
          <h1>✅ Connected to Xero!</h1>
          <p>You can close this window.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage('xero-auth-success', '*');
              setTimeout(() => window.close(), 1000);
            } else {
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('💥 OAuth callback error:', error)
    console.error('💥 Error details:', (error as any)?.message || 'No error message')
    console.error('💥 Error stack:', (error as any)?.stack || 'No stack trace')
    console.error('💥 Error type:', typeof error)
    console.error('💥 Error object:', JSON.stringify(error, null, 2))
    
    // Return more detailed error information for debugging
    let errorMessage = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      errorMessage = (error as any).message || error.toString() || 'Object error without message'
    }
    
    return new Response(`
      <html>
        <body>
          <h1>Authentication Error</h1>
          <p>Something went wrong during authentication: ${errorMessage}</p>
          <p>Error type: ${typeof error}</p>
          <p>Please check the edge function logs for more details.</p>
          <details>
            <summary>Error Details (for debugging)</summary>
            <pre>${JSON.stringify({ 
              message: errorMessage, 
              type: typeof error,
              hasStack: !!((error as any)?.stack),
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </details>
          <script>
            if (window.opener) {
              window.opener.postMessage('xero-auth-error', '*');
              setTimeout(() => window.close(), 1000);
            } else {
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

serve(async (req) => {
  console.log(`🔥 Edge Function called: ${req.method} ${req.url}`)
  console.log(`🔥 Headers:`, Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request')
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests (OAuth callback) IMMEDIATELY - NO AUTH REQUIRED
  if (req.method === 'GET') {
    return handleOAuthCallback(req);
  }

  // Only POST requests need authentication from here on
  console.log('🔄 Processing POST request (API call)')

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ No authorization header in POST request')
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('❌ Invalid user token:', userError)
      throw new Error('Invalid user token')
    }

    console.log('✅ User authenticated:', user.email)

    const { action } = await req.json()
    console.log('📋 Action:', action)

    // Get Xero credentials from secrets
    const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
    const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')
    const xeroRedirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/xero-oauth`

    if (!xeroClientId || !xeroClientSecret) {
      throw new Error('Xero credentials not configured')
    }

    switch (action) {
      case 'initiate': {
        console.log('🚀 Initiating OAuth flow...')
        // Generate OAuth URL
        const scopes = 'openid profile email offline_access accounting.transactions accounting.contacts accounting.settings'
        const state = crypto.randomUUID()
        
        // Store state in database for verification
        await supabase
          .from('xero_oauth_states')
          .insert({ 
            user_id: user.id, 
            state: state,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          })

        const authUrl = `https://login.xero.com/identity/connect/authorize?` +
          `response_type=code&` +
          `client_id=${xeroClientId}&` +
          `redirect_uri=${encodeURIComponent(xeroRedirectUri)}&` +
          `scope=${encodeURIComponent(scopes)}&` +
          `state=${state}`

        console.log('✅ OAuth URL generated')

        return new Response(
          JSON.stringify({ auth_url: authUrl }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'status': {
        console.log('🔍 Checking connection status...')
        // Check connection status and refresh token if needed
        const { data: connection } = await supabase
          .from('xero_connections')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!connection) {
          console.log('❌ No connection found')
          return new Response(
            JSON.stringify({ 
              connected: false,
              connection: null
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

        // Check if token needs refresh
        const now = new Date()
        const expiresAt = new Date(connection.expires_at)
        
        if (now >= expiresAt) {
          console.log('🔄 Token expired, refreshing...')
          // Refresh token
          const refreshResponse = await fetch('https://identity.xero.com/connect/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${xeroClientId}:${xeroClientSecret}`)}`
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: connection.refresh_token
            })
          })

          if (!refreshResponse.ok) {
            console.error('❌ Failed to refresh access token')
            return new Response(
              JSON.stringify({ 
                connected: false,
                connection: null,
                error: 'Token refresh failed - please reconnect'
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }

          const tokens = await refreshResponse.json()

          // Update stored tokens with better handling
          const updatedConnection = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || connection.refresh_token, // Keep existing if new one not provided
            expires_at: new Date(Date.now() + (tokens.expires_in || 1800) * 1000).toISOString(),
            last_sync: new Date().toISOString()
          }
          
          await supabase
            .from('xero_connections')
            .update(updatedConnection)
            .eq('user_id', user.id)

          console.log('✅ Token refreshed successfully')
        }

        console.log('✅ Connection status checked')

        return new Response(
          JSON.stringify({ 
            connected: true,
            connection: {
              tenant_name: connection.tenant_name,
              connected_at: connection.connected_at
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'disconnect': {
        console.log('🔌 Disconnecting from Xero...')
        // Disconnect from Xero
        await supabase
          .from('xero_connections')
          .delete()
          .eq('user_id', user.id)

        console.log('✅ Disconnected successfully')

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('💥 POST request error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})