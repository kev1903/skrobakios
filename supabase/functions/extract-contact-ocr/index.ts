import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    console.log('Processing image for contact extraction...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an OCR assistant that extracts contact information from images like business cards, contact sheets, or documents. 

Extract the following information and return it as a JSON object:
- name: Full name of the person
- company: Company/organization name
- email: Email address
- phone: Phone number
- trade_industry: Industry or trade (e.g., "Plumbing", "Electrical", "General Contractor", etc.)
- category: One of "client", "contractor", "supplier", "consultant", "other"

If any field cannot be found, return null for that field. Only return the JSON object, no other text.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract contact information from this image:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    console.log('Extracted text:', extractedText);

    // Try to parse as JSON
    let contactData;
    try {
      contactData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse JSON from OpenAI response:', extractedText);
      // Return a fallback structure
      contactData = {
        name: null,
        company: null,
        email: null,
        phone: null,
        trade_industry: null,
        category: 'other'
      };
    }

    return new Response(JSON.stringify({ contactData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-contact-ocr function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      contactData: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});