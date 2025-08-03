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

interface GeocodeResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  error?: string;
}

// Enhanced address cleaning for Australian addresses
function cleanAustralianAddress(address: string): string[] {
  if (!address) return [];
  
  let cleaned = address
    .trim()
    .replace(/\s+/g, ' ')  // normalize spaces
    .replace(/,+/g, ',')   // normalize commas
    .replace(/^,|,$/g, '') // remove leading/trailing commas
  
  const variations = [
    cleaned,
    `${cleaned}, Australia`,
    `${cleaned}, VIC, Australia`,
    `${cleaned}, Victoria, Australia`
  ];
  
  // If no state mentioned, add Victoria variations
  if (!cleaned.toLowerCase().includes('vic') && 
      !cleaned.toLowerCase().includes('victoria')) {
    variations.push(`${cleaned}, VIC`);
    variations.push(`${cleaned}, Victoria`);
  }
  
  return variations;
}

// Geocode a single address with multiple attempts
async function geocodeAddress(address: string, mapboxToken: string): Promise<GeocodeResult> {
  const variations = cleanAustralianAddress(address);
  
  for (const variation of variations) {
    try {
      console.log(`🔍 Trying variation: "${variation}"`);
      
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(variation)}.json?access_token=${mapboxToken}&country=au&limit=1&autocomplete=false`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`📍 API Response for "${variation}":`, JSON.stringify(data, null, 2));
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;
        
        console.log(`✅ SUCCESS: ${variation} → ${latitude}, ${longitude}`);
        
        return {
          success: true,
          latitude,
          longitude,
          formatted_address: feature.place_name
        };
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error geocoding "${variation}":`, error);
    }
  }
  
  return {
    success: false,
    error: `Failed to geocode "${address}" with all variations`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🌍 === STARTING PROFESSIONAL GEOCODING SERVICE ===')
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const mapboxToken = Deno.env.get('MAPBOX_TOKEN')
    
    if (!mapboxToken) {
      console.error('❌ CRITICAL: Mapbox token not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Mapbox token found, length:', mapboxToken.length)
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get projects that need geocoding
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, location, latitude, longitude')
      .not('location', 'is', null)
      .or('latitude.is.null,longitude.is.null')
      .limit(5) // Process fewer at a time for reliability

    if (projectsError) {
      console.error('❌ Database error:', projectsError)
      throw projectsError
    }

    if (!projects || projects.length === 0) {
      console.log('✅ All projects already geocoded')
      return new Response(
        JSON.stringify({ 
          message: 'All projects already have coordinates', 
          geocoded: 0,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🎯 Found ${projects.length} projects requiring geocoding`)
    
    let successCount = 0
    const results = []

    // Process each project
    for (const project of projects) {
      console.log(`\n🏗️ Processing project: ${project.id} - "${project.location}"`)
      
      const geocodeResult = await geocodeAddress(project.location, mapboxToken)
      
      if (geocodeResult.success && geocodeResult.latitude && geocodeResult.longitude) {
        // Update project with coordinates
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
            geocoded_at: new Date().toISOString()
          })
          .eq('id', project.id)

        if (updateError) {
          console.error(`❌ Failed to update project ${project.id}:`, updateError)
        } else {
          successCount++
          results.push({
            id: project.id,
            original_address: project.location,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
            formatted_address: geocodeResult.formatted_address
          })
          console.log(`✅ Updated project ${project.id} in database`)
        }
      } else {
        console.error(`❌ Failed to geocode: ${project.location} - ${geocodeResult.error}`)
      }
      
      // Rate limiting between projects
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log(`\n🎉 === GEOCODING COMPLETE ===`)
    console.log(`✅ Successfully geocoded: ${successCount}/${projects.length} projects`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully geocoded ${successCount} of ${projects.length} projects`,
        geocoded: successCount,
        total: projects.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 CRITICAL ERROR:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Geocoding service failed',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})