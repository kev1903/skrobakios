import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Decode a full base64 string into a Uint8Array (do NOT chunk arbitrarily)
function base64ToUint8Array(base64String: string) {
  // Remove possible data URL prefix just in case
  const clean = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  const binaryString = atob(clean);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Voice transcribe request received')
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable not set')
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { audio } = await req.json()
    console.log('Audio data received, length:', audio?.length || 0)

    if (!audio) {
      return new Response(JSON.stringify({ error: 'No audio data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Decode audio
    const binaryAudio = base64ToUint8Array(audio)
    console.log('Binary audio length:', binaryAudio.length)

    // Prepare form data with proper audio format and STRICT English-only settings
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/wav' })
    formData.append('file', blob, 'audio.wav')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')  // Force English language detection
    formData.append('prompt', 'This is English speech. Transcribe only in English language. Do not use Korean, Chinese, Japanese or any other language.')  // Add prompt to guide transcription

    console.log('Sending request to OpenAI...')
    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    })

    console.log('OpenAI response status:', response.status)

    if (!response.ok) {
      const text = await response.text()
      console.error('OpenAI API error:', response.status, text)
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} - ${text}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await response.json()
    let transcribedText = result.text || ''
    console.log('Raw transcription result:', transcribedText)
    
    // CRITICAL: Filter out any non-English text before returning
    const hasNonEnglish = /[^\x00-\x7F]/.test(transcribedText)
    if (hasNonEnglish) {
      console.warn('WARNING: Transcription contains non-English characters!')
      console.warn('Original text:', transcribedText)
      
      // Remove all non-ASCII characters and clean up
      transcribedText = transcribedText.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim()
      
      // If nothing remains after filtering, return a safe fallback
      if (!transcribedText || transcribedText.length < 2) {
        console.warn('Filtered transcription too short, using fallback')
        transcribedText = 'Sorry, could not understand the speech clearly.'
      }
      
      console.log('Filtered text:', transcribedText)
    }
    
    console.log('Final transcription result:', transcribedText)

    return new Response(
      JSON.stringify({ text: transcribedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in voice-transcribe:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})