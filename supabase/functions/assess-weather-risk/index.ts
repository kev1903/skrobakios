import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface WeatherRisk {
  projectId: string;
  projectName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  affectedDays: number;
  nextUnsafeDay: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projects } = await req.json()
    
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return new Response(
        JSON.stringify({ 
          overallRisk: 'low',
          risks: [],
          summary: 'No active projects to assess'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Assessing weather risk for ${projects.length} projects`)

    const risks: WeatherRisk[] = []

    // Assess each project location
    for (const project of projects) {
      try {
        const lat = project.latitude || -37.8136
        const lon = project.longitude || 144.9631

        // Fetch 5-day forecast from Open-Meteo
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&forecast_days=5`
        )

        if (!response.ok) {
          console.error(`Failed to fetch weather for project ${project.name}`)
          continue
        }

        const weatherData = await response.json()
        const daily = weatherData.daily

        const warnings: string[] = []
        let affectedDays = 0
        let nextUnsafeDay: string | null = null
        let maxRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

        // Analyze each day
        for (let i = 0; i < daily.time.length; i++) {
          const date = daily.time[i]
          const weatherCode = daily.weather_code[i]
          const precipitation = daily.precipitation_probability_max[i]
          const windSpeed = daily.wind_speed_10m_max[i] * 3.6 // Convert to km/h
          const windGusts = daily.wind_gusts_10m_max[i] * 3.6

          const dayWarnings: string[] = []
          let dayRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'

          // Check for heavy rain (weather codes 61-99)
          if (weatherCode >= 61 && weatherCode <= 99) {
            if (weatherCode >= 95) {
              dayWarnings.push('Thunderstorm - All work must stop')
              dayRisk = 'critical'
            } else if (weatherCode >= 80) {
              dayWarnings.push('Heavy rain showers - Outdoor work unsafe')
              dayRisk = 'high'
            } else if (weatherCode >= 63) {
              dayWarnings.push('Moderate to heavy rain - Limited outdoor work')
              dayRisk = 'high'
            } else {
              dayWarnings.push('Light rain - Caution for outdoor work')
              dayRisk = 'medium'
            }
          }

          // Check precipitation probability
          if (precipitation > 70) {
            dayWarnings.push(`High rain chance (${precipitation}%)`)
            if (dayRisk === 'low') dayRisk = 'medium'
          }

          // Check for dangerous wind conditions
          if (windGusts > 60) {
            dayWarnings.push('Extreme wind gusts - No crane/scaffolding work')
            dayRisk = 'critical'
          } else if (windSpeed > 50 || windGusts > 45) {
            dayWarnings.push('Strong winds - No elevated work')
            dayRisk = 'high'
          } else if (windSpeed > 35) {
            dayWarnings.push('Moderate winds - Caution with crane operations')
            if (dayRisk === 'low') dayRisk = 'medium'
          }

          if (dayWarnings.length > 0) {
            affectedDays++
            if (!nextUnsafeDay) {
              nextUnsafeDay = date
            }

            const dateStr = new Date(date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })
            warnings.push(`${dateStr}: ${dayWarnings.join(', ')}`)

            // Update max risk level
            if (dayRisk === 'critical' || maxRiskLevel === 'critical') {
              maxRiskLevel = 'critical'
            } else if (dayRisk === 'high' && maxRiskLevel !== 'critical') {
              maxRiskLevel = 'high'
            } else if (dayRisk === 'medium' && maxRiskLevel === 'low') {
              maxRiskLevel = 'medium'
            }
          }
        }

        risks.push({
          projectId: project.id,
          projectName: project.name,
          riskLevel: maxRiskLevel,
          warnings: warnings.slice(0, 3), // Limit to 3 warnings per project
          affectedDays,
          nextUnsafeDay
        })

      } catch (error) {
        console.error(`Error assessing project ${project.name}:`, error)
      }
    }

    // Calculate overall risk
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
    const criticalProjects = risks.filter(r => r.riskLevel === 'critical').length
    const highRiskProjects = risks.filter(r => r.riskLevel === 'high').length
    const mediumRiskProjects = risks.filter(r => r.riskLevel === 'medium').length

    if (criticalProjects > 0) {
      overallRisk = 'critical'
    } else if (highRiskProjects > 0) {
      overallRisk = 'high'
    } else if (mediumRiskProjects > 0) {
      overallRisk = 'medium'
    }

    const totalAffectedDays = risks.reduce((sum, r) => sum + r.affectedDays, 0)

    return new Response(
      JSON.stringify({
        overallRisk,
        risks,
        summary: risks.length > 0 
          ? `${risks.length} projects assessed, ${totalAffectedDays} affected days in next 5 days`
          : 'No weather risks detected',
        assessedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Weather risk assessment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
