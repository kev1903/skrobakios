import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🔥 Edge Function called: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request')
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // ========================================
  // HANDLE GET REQUESTS (OAuth Callback from Xero)
  // ========================================
  if (req.method === 'GET') {
    console.log('🔄 Processing GET request (OAuth callback)')
    
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
        .single()

      if (stateError || !stateRecord) {
        console.error('❌ Invalid or expired state:', stateError)
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
      console.log('✅ Tokens received')

      // Get tenant information
      console.log('🔄 Fetching tenant info...')
      const connectionsResponse = await fetch('https://api.xero.com/connections', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      const connections = await connectionsResponse.json()
      console.log('✅ Tenant info received:', connections[0]?.tenantName)

      // Store tokens and connection info
      console.log('💾 Storing connection data...')
      const { error: insertError } = await supabase
        .from('xero_connections')
        .upsert({
          user_id: stateRecord.user_id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          tenant_id: connections[0]?.tenantId,
          tenant_name: connections[0]?.tenantName,
          connected_at: new Date().toISOString()
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
      return new Response(`
        <html>
          <body>
            <h1>Authentication Error</h1>
            <p>Something went wrong during authentication. Please try again.</p>
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
  }

  // ========================================
  // HANDLE POST REQUESTS (App API calls)
  // ========================================
  if (req.method === 'POST') {
    console.log('🔄 Processing POST request (API call)')

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
          const scopes = 'openid profile email accounting.transactions accounting.contacts accounting.settings'
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
            JSON.stringify({ authUrl }),
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

            // Update stored tokens
            await supabase
              .from('xero_connections')
              .update({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
              })
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
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
  }

  // Handle unsupported methods
  console.log('❌ Unsupported method:', req.method)
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405 
    }
  )
})