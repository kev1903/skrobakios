import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Project {
  id: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🌍 Starting geocoding process...')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const mapboxToken = Deno.env.get('MAPBOX_TOKEN')
    
    if (!mapboxToken) {
      console.error('❌ Mapbox token not found')
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get projects that need geocoding (have location but no coordinates)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, location, latitude, longitude')
      .not('location', 'is', null)
      .or('latitude.is.null,longitude.is.null')
      .limit(10) // Process in batches to avoid rate limits

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }

    if (!projects || projects.length === 0) {
      console.log('✅ No projects need geocoding')
      return new Response(
        JSON.stringify({ message: 'No projects need geocoding', geocoded: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🎯 Found ${projects.length} projects to geocode`)
    let geocodedCount = 0
    const results = []

    // Geocode each project
    for (const project of projects) {
      if (!project.location) continue

      try {
        console.log(`🔍 Geocoding: ${project.location}`)
        
        // Clean and format the address for better geocoding
        let cleanAddress = project.location
          .replace(/\s+/g, ' ')  // normalize spaces
          .trim()
        
        // Add Victoria/VIC if not present for Australian addresses
        if (!cleanAddress.toLowerCase().includes('vic') && 
            !cleanAddress.toLowerCase().includes('victoria') &&
            !cleanAddress.toLowerCase().includes('australia')) {
          cleanAddress += ', VIC, Australia'
        }
        
        console.log(`🔧 Cleaned address: ${cleanAddress}`)
        
        // Use Mapbox Geocoding API with simpler, more reliable parameters
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json?access_token=${mapboxToken}&country=au&limit=1&autocomplete=false`
        
        console.log(`🌐 Geocoding URL: ${geocodeUrl}`)
        
        const geocodeResponse = await fetch(geocodeUrl)
        
        if (!geocodeResponse.ok) {
          console.error(`❌ HTTP Error ${geocodeResponse.status}: ${geocodeResponse.statusText}`)
          continue
        }
        const geocodeData = await geocodeResponse.json()
        
        console.log(`📍 Geocoding response:`, JSON.stringify(geocodeData, null, 2))
        
        if (geocodeData.features && geocodeData.features.length > 0) {
          const [longitude, latitude] = geocodeData.features[0].center
          const placeName = geocodeData.features[0].place_name
          
          console.log(`✅ Geocoded ${project.location} → ${latitude}, ${longitude} (${placeName})`)
          
          // Update project with coordinates
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              latitude: latitude,
              longitude: longitude,
              geocoded_at: new Date().toISOString()
            })
            .eq('id', project.id)

          if (updateError) {
            console.error(`❌ Error updating project ${project.id}:`, updateError)
          } else {
            geocodedCount++
            results.push({
              id: project.id,
              location: project.location,
              latitude,
              longitude,
              placeName
            })
          }
        } else {
          console.warn(`⚠️ No geocoding results for: ${project.location}`)
          console.warn(`🔍 Tried with cleaned address: ${cleanAddress}`)
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`❌ Error geocoding ${project.location}:`, error)
      }
    }

    console.log(`🎉 Successfully geocoded ${geocodedCount} projects`)
    
    return new Response(
      JSON.stringify({
        message: `Successfully geocoded ${geocodedCount} projects`,
        geocoded: geocodedCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Geocoding function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})