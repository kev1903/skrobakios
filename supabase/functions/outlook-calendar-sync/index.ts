import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string;
  subject: string;
  body?: {
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  showAs: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    switch (action) {
      case 'auth-url':
        return handleAuthUrl(req)
      
      case 'callback':
        return handleCallback(req, supabase, user.user.id)
      
      case 'sync':
        return handleSync(req, supabase, user.user.id)
      
      case 'disconnect':
        return handleDisconnect(req, supabase, user.user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in outlook-calendar-sync:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleAuthUrl(req: Request) {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
  if (!clientId) {
    return new Response(
      JSON.stringify({ error: 'Microsoft Client ID not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const redirectUri = `${req.url.split('/outlook-calendar-sync')[0]}/outlook-calendar-sync?action=callback`
  const scopes = 'openid profile email https://graph.microsoft.com/Calendars.ReadWrite'
  const state = crypto.randomUUID()
  
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `response_mode=query`

  return new Response(
    JSON.stringify({ authUrl, state }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCallback(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  
  if (error) {
    return new Response(
      JSON.stringify({ error: `OAuth error: ${error}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'No authorization code received' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Exchange code for token
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')
  const redirectUri = `${req.url.split('?')[0]}?action=callback`

  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('Token exchange failed:', errorText)
    return new Response(
      JSON.stringify({ error: 'Failed to exchange code for token' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const tokenData: MicrosoftTokenResponse = await tokenResponse.json()

  // Get user profile from Microsoft Graph
  const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  })

  if (!profileResponse.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to get user profile' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const profile = await profileResponse.json()

  // Store integration in database
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
  
  const { data, error: dbError } = await supabase
    .from('calendar_integrations')
    .upsert({
      user_id: userId,
      provider: 'outlook',
      provider_user_id: profile.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      calendar_name: `${profile.displayName}'s Calendar`,
      sync_enabled: true,
    }, {
      onConflict: 'user_id,provider,calendar_id'
    })

  if (dbError) {
    console.error('Database error:', dbError)
    return new Response(
      JSON.stringify({ error: 'Failed to save integration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Redirect to success page
  const baseUrl = req.url.split('/functions')[0]
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      'Location': `${baseUrl}/tasks?outlook=connected`
    }
  })
}

async function handleSync(req: Request, supabase: any, userId: string) {
  // Get user's Outlook integration
  const { data: integration, error: integrationError } = await supabase
    .from('calendar_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'outlook')
    .eq('sync_enabled', true)
    .single()

  if (integrationError || !integration) {
    return new Response(
      JSON.stringify({ error: 'No Outlook integration found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if token needs refresh
  const tokenExpiry = new Date(integration.token_expires_at)
  const now = new Date()
  let accessToken = integration.access_token

  if (tokenExpiry <= now && integration.refresh_token) {
    accessToken = await refreshAccessToken(integration.refresh_token, supabase, integration.id)
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Failed to refresh token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Fetch calendar events from Microsoft Graph
  const startTime = new Date()
  startTime.setDate(startTime.getDate() - 30) // Last 30 days
  const endTime = new Date()
  endTime.setDate(endTime.getDate() + 90) // Next 90 days

  const eventsUrl = `https://graph.microsoft.com/v1.0/me/events?` +
    `$filter=start/dateTime ge '${startTime.toISOString()}' and start/dateTime le '${endTime.toISOString()}'&` +
    `$select=id,subject,body,start,end,location,attendees,showAs&` +
    `$top=250`

  const eventsResponse = await fetch(eventsUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!eventsResponse.ok) {
    console.error('Failed to fetch events:', await eventsResponse.text())
    return new Response(
      JSON.stringify({ error: 'Failed to fetch calendar events' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const eventsData = await eventsResponse.json()
  const events: CalendarEvent[] = eventsData.value || []

  // Sync events to database
  const syncedEvents = []
  for (const event of events) {
    const { error: eventError } = await supabase
      .from('external_calendar_events')
      .upsert({
        integration_id: integration.id,
        external_event_id: event.id,
        title: event.subject || 'Untitled Event',
        description: event.body?.content || null,
        start_time: event.start.dateTime,
        end_time: event.end.dateTime,
        location: event.location?.displayName || null,
        attendees: event.attendees?.map(a => ({
          email: a.emailAddress.address,
          name: a.emailAddress.name
        })) || [],
        status: event.showAs === 'free' ? 'free' : 'busy',
      }, {
        onConflict: 'integration_id,external_event_id'
      })

    if (!eventError) {
      syncedEvents.push(event)
    }
  }

  // Update last sync time
  await supabase
    .from('calendar_integrations')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integration.id)

  return new Response(
    JSON.stringify({ 
      success: true, 
      syncedEvents: syncedEvents.length,
      totalEvents: events.length 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDisconnect(req: Request, supabase: any, userId: string) {
  const { error } = await supabase
    .from('calendar_integrations')
    .delete()
    .eq('user_id', userId)
    .eq('provider', 'outlook')

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to disconnect integration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function refreshAccessToken(refreshToken: string, supabase: any, integrationId: string): Promise<string | null> {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID')
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET')

  try {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text())
      return null
    }

    const tokenData: MicrosoftTokenResponse = await response.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // Update stored tokens
    await supabase
      .from('calendar_integrations')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', integrationId)

    return tokenData.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}