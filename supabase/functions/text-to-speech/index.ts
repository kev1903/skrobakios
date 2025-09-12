import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Handle empty request body
    const requestText = await req.text();
    if (!requestText || requestText.trim() === '') {
      throw new Error('Empty request body');
    }

    let requestData;
    try {
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { text, voice } = requestData;

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating speech for text:', text.substring(0, 100));

    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'alloy',
        response_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      throw new Error(`Failed to generate speech: ${response.status} ${response.statusText}`);
    }

    // Convert audio buffer to base64 (process in chunks to prevent call stack exceeded)
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Process in chunks to prevent call stack overflow
    let binaryString = ''
    const chunkSize = 0x8000 // 32KB chunks
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      binaryString += String.fromCharCode.apply(null, Array.from(chunk))
    }
    
    const base64Audio = btoa(binaryString)

    console.log('Speech generation successful');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})