import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle GET requests (OAuth callback from Xero)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage('xero-auth-error', '*');
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }

      if (!code || !state) {
        return new Response('Missing code or state', { status: 400 })
      }

      // Verify state and get user_id
      const { data: stateRecord } = await supabase
        .from('xero_oauth_states')
        .select('user_id')
        .eq('state', state)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (!stateRecord) {
        return new Response('Invalid or expired state', { status: 400 })
      }

      // Get Xero credentials
      const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
      const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')
      const xeroRedirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/xero-oauth`

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
        throw new Error('Failed to exchange code for tokens')
      }

      const tokens = await tokenResponse.json()

      // Get tenant information
      const connectionsResponse = await fetch('https://api.xero.com/connections', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      const connections = await connectionsResponse.json()

      // Store tokens and connection info
      await supabase
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

      // Clean up state
      await supabase
        .from('xero_oauth_states')
        .delete()
        .eq('state', state)

      // Close popup window
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage('xero-auth-success', '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Handle POST requests (require authentication)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { action } = await req.json()

    // Get Xero credentials from secrets
    const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
    const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')
    const xeroRedirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/xero-oauth`

    if (!xeroClientId || !xeroClientSecret) {
      throw new Error('Xero credentials not configured')
    }

    switch (action) {
      case 'initiate': {
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

        return new Response(
          JSON.stringify({ authUrl }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      case 'callback': {
        // Handle OAuth callback
        const url = new URL(req.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const error = url.searchParams.get('error')

        if (error) {
          console.error('OAuth error:', error)
          return new Response('OAuth error', { status: 400 })
        }

        if (!code || !state) {
          return new Response('Missing code or state', { status: 400 })
        }

        // Verify state
        const { data: stateRecord } = await supabase
          .from('xero_oauth_states')
          .select('user_id')
          .eq('state', state)
          .eq('expires_at', 'gte', new Date().toISOString())
          .single()

        if (!stateRecord) {
          return new Response('Invalid or expired state', { status: 400 })
        }

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
          throw new Error('Failed to exchange code for tokens')
        }

        const tokens = await tokenResponse.json()

        // Get tenant information
        const connectionsResponse = await fetch('https://api.xero.com/connections', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        })

        const connections = await connectionsResponse.json()

        // Store tokens and connection info
        await supabase
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

        // Clean up state
        await supabase
          .from('xero_oauth_states')
          .delete()
          .eq('state', state)

        // Close popup window
        return new Response(`
          <html>
            <body>
              <script>
                window.opener.postMessage('xero-auth-success', '*');
                window.close();
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }

      case 'status': {
        // Check connection status and refresh token if needed
        const { data: connection } = await supabase
          .from('xero_connections')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!connection) {
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
          console.log('Token expired, refreshing...')
          // Refresh token
          const xeroClientId = Deno.env.get('XERO_CLIENT_ID')
          const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')

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
            console.error('Failed to refresh access token')
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

          console.log('Token refreshed successfully')
        }

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
        // Disconnect from Xero
        await supabase
          .from('xero_connections')
          .delete()
          .eq('user_id', user.id)

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})