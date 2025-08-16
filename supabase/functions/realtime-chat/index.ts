import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Handle WebSocket upgrade
    if (req.headers.get('upgrade') === 'websocket') {
      const { socket, response } = Deno.upgradeWebSocket(req)
      
      let openaiWs: WebSocket | null = null
      
      socket.onopen = async () => {
        console.log('Client connected to realtime chat')
        
        // Connect to OpenAI Realtime API
        try {
          openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'OpenAI-Beta': 'realtime=v1'
            }
          })
          
          openaiWs.onopen = () => {
            console.log('Connected to OpenAI Realtime API');
            // Wait for session.created before sending session.update
          }
          
          openaiWs.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('OpenAI message:', data.type)
            
            // After session is created, configure it
            if (data.type === 'session.created') {
              const sessionConfig = {
                type: 'session.update',
                session: {
                  modalities: ['text', 'audio'],
                  instructions: 'You are SkAi, a helpful AI assistant for Skrobaki construction management. Help users with their projects, tasks, and construction-related questions.',
                  voice: 'alloy',
                  input_audio_format: 'pcm16',
                  output_audio_format: 'pcm16',
                  input_audio_transcription: {
                    model: 'whisper-1'
                  },
                  turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000
                  },
                  temperature: 0.8,
                  max_response_output_tokens: 'inf'
                }
              }
              openaiWs?.send(JSON.stringify(sessionConfig))
            }
            
            // Forward relevant messages to client
            if (data.type === 'response.audio.delta' || 
                data.type === 'response.audio_transcript.delta' || 
                data.type === 'response.done' ||
                data.type === 'session.created' ||
                data.type === 'session.updated') {
              socket.send(JSON.stringify(data))
            }
          }
          
          openaiWs.onerror = (error) => {
            console.error('OpenAI WebSocket error:', error)
            socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }))
          }
          
          openaiWs.onclose = () => {
            console.log('OpenAI WebSocket closed')
            socket.close()
          }
          
        } catch (error) {
          console.error('Failed to connect to OpenAI:', error)
          socket.send(JSON.stringify({ type: 'error', message: 'Failed to connect to AI service' }))
        }
      }
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Client message:', data.type)
          
          // Forward client messages to OpenAI
          if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(JSON.stringify(data))
          }
        } catch (error) {
          console.error('Error processing client message:', error)
        }
      }
      
      socket.onclose = () => {
        console.log('Client disconnected from realtime chat')
        if (openaiWs) {
          openaiWs.close()
        }
      }
      
      socket.onerror = (error) => {
        console.error('Client WebSocket error:', error)
        if (openaiWs) {
          openaiWs.close()
        }
      }
      
      return response
    }
    
    return new Response('WebSocket endpoint', { headers: corsHeaders })
    
  } catch (error) {
    console.error('Error in realtime-chat function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})