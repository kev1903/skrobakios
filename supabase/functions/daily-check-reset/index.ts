import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting daily check reset at:', new Date().toISOString())

    // Delete all daily checks from yesterday and older
    // This effectively "resets" the daily checks for today
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data, error } = await supabase
      .from('project_daily_checks')
      .delete()
      .lt('checked_date', yesterday.toISOString().split('T')[0])

    if (error) {
      console.error('Error deleting old daily checks:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to reset daily checks', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Daily check reset completed successfully')
    console.log('Deleted checks older than:', yesterday.toISOString().split('T')[0])

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily checks reset successfully',
        resetDate: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in daily check reset:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})